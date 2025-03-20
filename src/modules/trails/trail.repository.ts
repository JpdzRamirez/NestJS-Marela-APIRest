import { Injectable } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { Trail } from './trail.entity';

import { TrailDto } from './dto/trail.dto';

@Injectable()
export class TrailRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los clientes y retorna los clientes insertados o duplicados
     */
    async submitAllTrails(
      schema: string, 
      trailsArrayFiltred: { uniqueTrails: Trail[]; duplicateTrails: TrailDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_ruta: string;
        nombre: string;        
      }[];
      duplicated: TrailDto[]; 
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      let messageResponse='';

      const insertedTrails: { 
        id: number; 
        id_ruta: string;
        nombre: string; 
        unidades_municipales: Record<string, any>[] | null;                
       }[] = [];
      const duplicateTrails=trailsArrayFiltred.duplicateTrails;
      const uniqueFilteredTrails = new Map<string, Trail>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener clientes que ya existen en la base de datos
        const existingTrails= await entityManager
        .createQueryBuilder()
        .select(['id', 'id_ruta','nombre'])
        .from(`${schema}.rutas`, 'rutas')
        .where('rutas.id_ruta IN (:...id_rutas)', {
          id_rutas: trailsArrayFiltred.uniqueTrails.map((tc) => tc.id_ruta.toString()),
        })
        .getRawMany();

        for (const trail of trailsArrayFiltred.uniqueTrails) {
        
            const referenceKey = trail.nombre.toString().trim();
        
              if (existingTrails.some((tra) => tra.id_ruta === trail.id_ruta)) {
                let duplicatedDBTrail:TrailDto = {
                      id:trail.id,
                      id_ruta:trail.id_ruta,
                      nombre:trail.nombre,                                                                                           
                      unidades_municipales:trail.unidades_municipales,
                      source_failure:'DataBase'
                  };
                  duplicateTrails.push({ ...duplicatedDBTrail }); // Guardar duplicado
              }else {
                uniqueFilteredTrails.set(referenceKey, { ...trail });
              }
        }
        if (uniqueFilteredTrails.size  > 0) {
        // 🔥 Insertar los clientes con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.rutas`, [
            'id_ruta',
            'nombre',
            'unidades_municipales',              
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueFilteredTrails.values()).map((tra) => ({
              id_ruta: tra.id_ruta,              
              nombre: tra.nombre,
              unidades_municipales: `'${JSON.stringify(tra.unidades_municipales)}'::jsonb`,    
              uploaded_by_authsupa: tra.uploaded_by_authsupa,                                  
              sync_with: () => `'${JSON.stringify(tra.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_ruta", "nombre","unidades_municipales"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedTrails.push(
          ...Array.from(uniqueFilteredTrails.values()).map((tra) => ({
            id: tra.id, 
            id_ruta: tra.id_ruta,
            nombre:tra.nombre,
            unidades_municipales:tra.unidades_municipales,
          }))
        );       
          messageResponse="Cargue exitoso, se han obtenido los siguientes resultados:";
        }else{
          messageResponse = "La base de datos ya se encuentra sincronizada; Datos ya presentes en BD";                
          throw new Error(messageResponse);
        }

        await queryRunner.commitTransaction();

        return {
          message: messageResponse,
          status: true,
          inserted: insertedTrails, 
          duplicated: duplicateTrails,
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ Error en submitAllCities:", error);
        
        return {
          message: "¡El cargue ha terminado! -> "+ error.message,        
          status: false,
          inserted: [],
          duplicated: duplicateTrails
        };
      } finally {
        await queryRunner.release();
      }
    }


/** ✅
   * Retorna todas lass rutas que el usuario no tiene sincronizados
   */
  async getAllTrails(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    cities:Trail[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncTrails = await entityManager
      .createQueryBuilder()
      .select('rutas.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.rutas`, 'rutas')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(rutas.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes rutas no sincronizados:',
          cities: notSyncTrails
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en getAllTrails:', error);
      return {
        message: "¡Error en la conexión, retornando desde la base de datos!! -> "+ error.message, 
        cities: []
      };
    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   *  Actualiza los registros sincronizados en el mobil
   */
  async syncTrails(
    schema: string,
    uuid_authsupa: string,
    trailsArrayFiltred:  { uniqueTrails: TrailDto[]; duplicateTrails: TrailDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    duplicated: TrailDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let messageResponse='';
  
    try {
      const entityManager = queryRunner.manager;      
  
      if(trailsArrayFiltred.uniqueTrails.length>0){ 
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingTrails = await entityManager
        .createQueryBuilder()
        .select("rutas.*")
        .from(`${schema}.rutas`, "rutas")
        .where("rutas.id_ruta IN (:...id_rutas)", {
          id_rutas: trailsArrayFiltred.uniqueTrails.map((tc) => tc.id_ruta.toString()),
      })
      .getRawMany();
  
      for (const trail of trailsArrayFiltred.uniqueTrails) {
        const existingTrail= existingTrails.find(
          (c) => c.id_ruta.localeCompare(trail.id_ruta, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingTrail) {
          let syncWithArray = existingTrail.sync_with 
          ? (typeof existingTrail.sync_with === "string" 
              ? JSON.parse(existingTrail.sync_with) 
              : existingTrail.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: existingTrail.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.rutas`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("id_ruta = :id_ruta", { id_ruta: existingTrail.id_ruta })
              .execute();
          }
        }
      }
      messageResponse="Sincronización exitosa, se han obtenido los siguientes resultados";
      }else{
        messageResponse= "No hay datos pendientes por sincronizar";        
        throw new Error(messageResponse);
      }
      await queryRunner.commitTransaction();
      return {
        message: messageResponse,
        status: true,
        duplicated: trailsArrayFiltred.duplicateTrails,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Error en syncCities:", error);
      return {
        message: "¡La Sincronización ha terminado! -> "+ error.message, 
        status: false,
        duplicated: trailsArrayFiltred.duplicateTrails,
      };
    } finally {
      await queryRunner.release();
    }
  }


};
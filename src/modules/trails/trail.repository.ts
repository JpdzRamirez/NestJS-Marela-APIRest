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
      trailsArrayFiltred: { uniqueTrails: Trail[]; duplicateCities: TrailDto[] }
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
       }[] = [];
      const duplicateCities=trailsArrayFiltred.duplicateCities;
      const uniqueFilteredCities = new Map<string, Trail>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener clientes que ya existen en la base de datos
        const existingCities= await entityManager
        .createQueryBuilder()
        .select(['id', 'nombre'])
        .from(`${schema}.ciudades`, 'ciudades')
        .where("LOWER(unaccent(ciudades.nombre)) IN (:...nombres)", {
          nombres: trailsArrayFiltred.uniqueTrails.map((tc) => tc.nombre.toString()),
        })
        .getRawMany();

        for (const trail of trailsArrayFiltred.uniqueTrails) {
        
            const referenceKey = trail.nombre.toString().trim();
        
              if (existingCities.some((tra) => cty.nombre === trail.nombre)) {
                let duplicatedDBCity:TrailDto = {
                      id:tra.id,
                      id_ciudad:tra.id_ciudad,
                      nombre:tra.nombre,                                                                                           
                      source_failure:'DataBase'
                  };
                  duplicateCities.push({ ...duplicatedDBCity }); // Guardar duplicado
              }else {
                uniqueFilteredCities.set(referenceKey, { ...city });
              }
        }
        if (uniqueFilteredCities.size  > 0) {
        // 🔥 Insertar los clientes con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.unidad_municipal`, [
            'id_ciudad',
            'nombre',
            'codigo',              
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueFilteredCities.values()).map((cty) => ({
              id_ciudad: cty.id_ciudad,              
              nombre: cty.nombre,
              codigo: cty.codigo,    
              uploaded_by_authsupa: cty.uploaded_by_authsupa,                                  
              sync_with: () => `'${JSON.stringify(cty.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_ciudad", "nombre","codigo"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedCities.push(
          ...Array.from(uniqueFilteredCities.values()).map((cty) => ({
            id: cty.id, 
            id_ciudad: cty.id_ciudad,
            nombre:cty.nombre,
            codigo:cty.codigo,
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
          inserted: insertedCities, 
          duplicated: duplicateCities,
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ Error en submitAllCities:", error);
        
        return {
          message: "¡El cargue ha fallado! -> "+ error.message,        
          status: false,
          inserted: [],
          duplicated: duplicateCities
        };
      } finally {
        await queryRunner.release();
      }
    }


/** ✅
   * Retorna todas lass unidades municipales que el usuario no tiene sincronizados
   */
  async getAllTrails(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    cities:City[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncCities = await entityManager
      .createQueryBuilder()
      .select('ciudades.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.ciudades`, 'ciudades')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(ciudades.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes unidades municipales no sincronizados:',
          cities: notSyncCities
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en getAllCities:', error);
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
    citiesArrayFiltred:  { uniqueCities: CityDto[]; duplicateCities: CityDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    duplicated: CityDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let messageResponse='';
  
    try {
      const entityManager = queryRunner.manager;      
  
      if(citiesArrayFiltred.uniqueCities.length>0){ 
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingCities = await entityManager
        .createQueryBuilder()
        .select("ciudades.*")
        .from(`${schema}.ciudades`, "ciudades")
        .where("LOWER(unaccent(ciudades.nombre)) IN (:...nombres)", {
          nombres: citiesArrayFiltred.uniqueCities.map((tc) => tc.nombre.toString()),
      })
      .getRawMany();
  
      for (const city of citiesArrayFiltred.uniqueCities) {
        const existingCity= existingCities.find(
          (c) => c.nombre.localeCompare(city.nombre, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingCity) {
          let syncWithArray = existingCity.sync_with 
          ? (typeof existingCity.sync_with === "string" 
              ? JSON.parse(existingCity.sync_with) 
              : existingCity.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: existingCity.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.ciudades`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("id_ciudad = :id_ciudad", { id_ciudad: existingCity.id_ciudad })
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
        duplicated: citiesArrayFiltred.duplicateCities,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Error en syncCities:", error);
      return {
        message: "¡La Sincronización ha fallado, retornando desde la base de datos!! -> "+ error.message, 
        status: false,
        duplicated: citiesArrayFiltred.duplicateCities,
      };
    } finally {
      await queryRunner.release();
    }
  }


};
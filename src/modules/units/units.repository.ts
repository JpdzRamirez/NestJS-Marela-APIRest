import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { Unit } from './units.entity';

import { UnitDto } from './dto/units.dto';

@Injectable()
export class UnitsRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los clientes y retorna los clientes insertados o duplicados
     */
    async submitAllUnits(
      schema: string, 
      unitsArrayFiltred: { uniqueUnits: Unit[]; duplicateUnits: UnitDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_unidad: string;
        nombre: string;        
      }[];
      duplicated: UnitDto[]; 
      existing:UnitDto[];
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const insertedUnits: { 
        id: number; 
        id_unidad: string;
        nombre: string;                  
       }[] = [];
      const duplicateUnits=unitsArrayFiltred.duplicateUnits;
      //Ciudades ya presentes en la base de datos
      const syncronizedUnits: UnitDto[] = [];
      const uniqueFilteredUnits = new Map<string, Unit>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener ciudades que ya existen en la base de datos
        const existingUnits= await entityManager
        .createQueryBuilder()
        .select(['id','id_unidad' ,'nombre'])
        .from(`${schema}.unidades`, 'unidades')
        .where("unidades.id_unidad IN (:...id_unidades)", {
            id_unidades: unitsArrayFiltred.uniqueUnits.map((tc) => tc.id_unidad.toString()),
        })
        .getRawMany();

        for (const unit of unitsArrayFiltred.uniqueUnits) {
        
            const referenceKey = unit.id_unidad.toString().trim();
        
              if (existingUnits.some((unt) => unt.id_unidad === unit.id_unidad)) {
                let duplicatedDBUnit:UnitDto = {
                      id:unit.id,
                      id_unidad:unit.id_unidad,
                      nombre:unit.nombre,                                                                    
                      source_failure:'DataBase'
                  };
                  syncronizedUnits.push({ ...duplicatedDBUnit }); // Guardar duplicado
              }else {
                uniqueFilteredUnits.set(referenceKey, { ...unit });
              }
        }
        if (uniqueFilteredUnits.size  > 0) {
        // 🔥 Insertar las unidades con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.unidades`, [
            'id_unidad',
            'nombre',                         
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueFilteredUnits.values()).map((unt) => ({
              id_unidad: unt.id_unidad,              
              nombre: unt.nombre,              
              uploaded_by_authsupa: unt.uploaded_by_authsupa,                                  
              sync_with: () => `'${JSON.stringify(unt.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_unidad", "nombre"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedUnits.push(
          ...Array.from(uniqueFilteredUnits.values()).map((unt) => ({
            id: unt.id, 
            id_unidad: unt.id_unidad,
            nombre:unt.nombre,            
          }))
        );       
        
        }else{                      
           throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
        }

        await queryRunner.commitTransaction();

        return {
          message: "Cargue exitoso, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedUnits, 
          duplicated: duplicateUnits,
          existing:syncronizedUnits
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();        
        
        return {
          message: "¡El cargue ha terminado! retornando desde submitAllUnits -> "+ error.message,        
          status: false,
          inserted: [],
          duplicated: duplicateUnits,
          existing:syncronizedUnits
        };
      } finally {
        await queryRunner.release();
      }
    }


/** ✅
   * Retorna todas lass ciudades que el usuario no tiene sincronizados
   */
  async getAllUnits(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    status:boolean,
    units:Unit[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncUnits = await entityManager
      .createQueryBuilder()
      .select('unidades.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.unidades`, 'unidades')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(unidades.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes unidades no sincronizados:',
          status:true,
          units: notSyncUnits
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();

      return {
        message: `¡Error en la conexión, retornando desde getAllUnits!! ->  ${error.message || 'Error desconocido'}`,
        status:false,
        units: []
      };
    } finally {

      await queryRunner.release();

    }
  }

  /** ✅
   *  Actualiza los registros sincronizados en el mobil
   */
  async syncUnits(
    schema: string,
    uuid_authsupa: string,
    unitsArrayFiltred:  { uniqueUnits: UnitDto[]; duplicateUnits: UnitDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    syncronized: UnitDto[],
    duplicated: UnitDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const syncronized : UnitDto[] = [];
  
    try {
      const entityManager = queryRunner.manager;      
  
      if(unitsArrayFiltred.uniqueUnits.length>0){ 
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingUnits = await entityManager
        .createQueryBuilder()
        .select("unidades.*")
        .from(`${schema}.unidades`, "unidades")
        .where("unidades.id_unidad IN (:...id_unidades)", {
            id_unidades: unitsArrayFiltred.uniqueUnits.map((tc) => tc.id_unidad.toString()),
      })
      .getRawMany();
  
      for (const unit of unitsArrayFiltred.uniqueUnits) {
        const existingUnit= existingUnits.find(
          (c) => c.id_ciudad.localeCompare(unit.id_unidad, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingUnit) {
          let syncWithArray = existingUnit.sync_with 
          ? (typeof existingUnit.sync_with === "string" 
              ? JSON.parse(existingUnit.sync_with) 
              : existingUnit.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: existingUnit.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.unidades`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("id_unidad = :id_unidad", { id_unidad: existingUnit.id_unidad })
              .execute();

              syncronized.push({ ...existingUnit });
          }
        }
      }      
      }
      if(syncronized.length ===0){
        throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
      }
        
      await queryRunner.commitTransaction();

      return {
        message: "Sincronización exitosa, se han obtenido los siguientes resultados",
        status: true,
        syncronized:syncronized,
        duplicated: unitsArrayFiltred.duplicateUnits,
      };
    } catch (error) {
      
      await queryRunner.rollbackTransaction();  

      return {
        message: `¡La Sincronización ha terminado, retornando desde syncUnits !! -> ${error.message || 'Error desconocido'}`,
        status: false,
        syncronized:syncronized,
        duplicated: unitsArrayFiltred.duplicateUnits,
      };
    } finally {
      await queryRunner.release();
    }
  }


};
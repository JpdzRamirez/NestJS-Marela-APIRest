import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { MunicipalUnit } from './municipal_unit.entity';

import { MunicipalUnitDto } from './dto/municipal_unit.dto';

@Injectable()
export class MunicipalUnitRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos  unidades municipales y las retorna los insertados o duplicados
     */
    async submitAllMunicipalUnits(
      schema: string, 
      municipalUnitArrayFiltred: { uniqueMunicipalUnits: MunicipalUnit[]; duplicateMunicipalUnits: MunicipalUnitDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_unidadmunicipal: string;
        nombre: string }[];
      duplicated: MunicipalUnitDto[]; 
      existing:MunicipalUnitDto[];
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();      

      const insertedMunicipalUnits: { 
        id: number; 
        id_unidadmunicipal: string;
        nombre: string;        
       }[] = [];
      const duplicateMunicipalUnits=municipalUnitArrayFiltred.duplicateMunicipalUnits;
      const syncronizedMunicipalUnits: MunicipalUnitDto[] = [];
      const uniqueFilteredMunicipalUnits = new Map<string, MunicipalUnit>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener Unidades municipales que ya existen en la base de datos
        const existingMunicipalUnits= await entityManager
        .createQueryBuilder()
        .select(['id','id_unidadmunicipal' ,'nombre'])
        .from(`${schema}.unidad_municipal`, 'unidad_municipal')
        .where('unidad_municipal.id_unidadmunicipal IN (:...id_unidadmunicipales)', {
          id_unidadmunicipales: municipalUnitArrayFiltred.uniqueMunicipalUnits.map((tc) => tc.id_unidadmunicipal.toString()),
        })
        .getRawMany();

        for (const municipal_unit of municipalUnitArrayFiltred.uniqueMunicipalUnits) {
        
            const referenceKey = municipal_unit.nombre.toString().trim();
        
              if (existingMunicipalUnits.some((mu) => mu.id_unidadmunicipal === municipal_unit.id_unidadmunicipal)) {
                let duplicatedDBMunicipalUnit:MunicipalUnitDto = {
                      id:municipal_unit.id,
                      id_unidadmunicipal:municipal_unit.id_unidadmunicipal,
                      nombre:municipal_unit.nombre, 
                      ciudad_id:municipal_unit.ciudad.id_ciudad,                    
                      departamento_id:municipal_unit.departamento.id_departamento,                     
                      source_failure:'DataBase'
                  };
                  syncronizedMunicipalUnits.push({ ...duplicatedDBMunicipalUnit }); // Guardar duplicado
              }else {
                uniqueFilteredMunicipalUnits.set(referenceKey, { ...municipal_unit });
              }
        }
        if (uniqueFilteredMunicipalUnits.size  > 0) {
        // 🔥 Insertar las unidades municipales con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.unidad_municipal`, [
            'id_unidadmunicipal',
            'nombre',
            'ciudad_id', 
            'departamento_id', 
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueFilteredMunicipalUnits.values()).map((mu) => ({
              id_unidadmunicipal: mu.id_unidadmunicipal,              
              nombre: mu.nombre,
              ciudad_id: mu.ciudad.id_ciudad,          
              departamento_id: mu.departamento.id_departamento,                   
              uploaded_by_authsupa: mu.uploaded_by_authsupa,
              sync_with: () => `'${JSON.stringify(mu.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_unidadmunicipal", "nombre"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedMunicipalUnits.push(
          ...Array.from(uniqueFilteredMunicipalUnits.values()).map((mu) => ({
            id: mu.id, 
            id_unidadmunicipal: mu.id_unidadmunicipal,
            nombre:mu.nombre,
          }))
        );       
      
        }else{                      
            throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
        }

        await queryRunner.commitTransaction();

        return {
          message: "Cargue exitoso, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedMunicipalUnits, 
          duplicated: duplicateMunicipalUnits,
          existing:syncronizedMunicipalUnits
        };
      } catch (error) {

        await queryRunner.rollbackTransaction();
                
        return {
          message: `¡El cargue ha terminado! -> ${error.message || 'Error desconocido'}`,      
          status: false,
          inserted: [],
          duplicated: duplicateMunicipalUnits,
          existing:syncronizedMunicipalUnits
        };
      } finally {
        await queryRunner.release();
      }
    }


/** ✅
   * Retorna todas lass unidades municipales que el usuario no tiene sincronizados
   */
  async getAllMunicipalUnits(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    status:boolean,
    municipal_units:MunicipalUnit[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncMunicipalUnits = await entityManager
      .createQueryBuilder()
      .select('unidad_municipal.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.unidad_municipal`, 'unidad_municipal')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(unidad_municipal.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes unidades municipales no sincronizados:',
        status:true,
        municipal_units: notSyncMunicipalUnits
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();
      
      return {
        message: `¡Error en la conexión, retornando desde la base de datos!! ->  ${error.message || 'Error desconocido'}`, 
        status:false,
        municipal_units: []
      };
    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   *  Actualiza los registros sincronizados en el mobil
   */
  async syncMunicipalUnits(
    schema: string,
    uuid_authsupa: string,
    municipal_unitArrayFiltred:  { uniqueMunicipalUnits: MunicipalUnitDto[]; duplicateMunicipalUnits: MunicipalUnitDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    syncronized: MunicipalUnitDto[],
    duplicated: MunicipalUnitDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    const syncronized : MunicipalUnitDto[] = [];

    try {
      const entityManager = queryRunner.manager;      
      
      if(municipal_unitArrayFiltred.uniqueMunicipalUnits.length>0){  
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingMunicipalUnits = await entityManager
        .createQueryBuilder()
        .select("unidad_municipal.*")
        .from(`${schema}.unidad_municipal`, "unidad_municipal")
        .where("unidad_municipal.id_unidadmunicipal IN (:...id_unidadmunicipales)", {
          id_unidadmunicipales: municipal_unitArrayFiltred.uniqueMunicipalUnits.map((tc) => tc.id_unidadmunicipal.toString()),
      })
      .getRawMany();
  
      for (const municipal_unit of municipal_unitArrayFiltred.uniqueMunicipalUnits) {
        const existingMunicipalUnit= existingMunicipalUnits.find(
          (c) => c.id_unidadmunicipal.localeCompare(municipal_unit.id_unidadmunicipal, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingMunicipalUnit) {
          let syncWithArray = existingMunicipalUnit.sync_with 
          ? (typeof existingMunicipalUnit.sync_with === "string" 
              ? JSON.parse(existingMunicipalUnit.sync_with) 
              : existingMunicipalUnit.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: municipal_unit.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.unidad_municipal`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("id_unidadmunicipal = :id_unidadmunicipal", { id_unidadmunicipal: existingMunicipalUnit.id_unidadmunicipal })
              .execute();

              syncronized.push({ ...existingMunicipalUnit });
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
        duplicated: municipal_unitArrayFiltred.duplicateMunicipalUnits,        
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();      

      return {
        message: `¡La Sincronización ha terminado, retornando desde syncStates !! -> ${error.message || 'Error desconocido'}`, 
        status: false,
        syncronized:syncronized,
        duplicated: municipal_unitArrayFiltred.duplicateMunicipalUnits,        
      };
    } finally {
      await queryRunner.release();
    }
  }


};
import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { State } from './state.entity';

import { StateDto } from './dto/state.dto';

@Injectable()
export class StateRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los departamentos y retorna los departamentos insertados o duplicados
     */
    async submitAllStates(
      schema: string, 
      statesArrayFiltred: { uniqueStates: State[]; duplicateStates: StateDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_departamento: string;
        nombre: string;
        codigo: number;
      }[];
      duplicated: StateDto[]; 
      existing:StateDto[];
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();      

      const insertedStates: { 
        id: number; 
        id_departamento: string;
        nombre: string;        
        codigo: number;  
       }[] = [];
      const duplicateStates=statesArrayFiltred.duplicateStates;
      //Departamentos ya presentes en la base de datos
      const syncronizedStates: StateDto[] = [];
      const uniqueFilteredStates = new Map<string, State>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener departamentos que ya existen en la base de datos
        const existingStates= await entityManager
        .createQueryBuilder()
        .select(['id','id_departamento', 'nombre'])
        .from(`${schema}.departamentos`, 'departamentos')
        .where("departamentos.id_departamento IN (:...id_departamentos)", {
          id_departamentos: statesArrayFiltred.uniqueStates.map((tc) => tc.id_departamento.toString()),
        })
        .getRawMany();

        for (const state of statesArrayFiltred.uniqueStates) {
        
            const referenceKey = state.nombre.toString().trim();
        
              if (existingStates.some((ste) => ste.id_departamento === state.id_departamento)) {
                let duplicatedDBState:StateDto = {
                      id:state.id,
                      id_departamento:state.id_departamento,
                      nombre:state.nombre,                                                                  
                      codigo:state.codigo,     
                      source_failure:'DataBase'
                  };
                  syncronizedStates.push({ ...duplicatedDBState }); // Guardar duplicado
              }else {
                uniqueFilteredStates.set(referenceKey, { ...state });
              }
        }
        if (uniqueFilteredStates.size  > 0) {
        // 🔥 Insertar los departamentos con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.departamentos`, [
            'id_departamento',
            'nombre',
            'codigo',              
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueFilteredStates.values()).map((ste) => ({
              id_departamento: ste.id_departamento,              
              nombre: ste.nombre,
              codigo: ste.codigo,    
              uploaded_by_authsupa: ste.uploaded_by_authsupa,                                  
              sync_with: () => `'${JSON.stringify(ste.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_departamento", "nombre","codigo"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedStates.push(
          ...Array.from(uniqueFilteredStates.values()).map((ste) => ({
            id: ste.id, 
            id_departamento: ste.id_departamento,
            nombre:ste.nombre,
            codigo:ste.codigo,
          }))
        );               
        }else{                      
          throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
        }

        await queryRunner.commitTransaction();

        return {
          message: "Cargue exitoso, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedStates, 
          duplicated: duplicateStates,
          existing:syncronizedStates
        };
      } catch (error) {
        
        await queryRunner.rollbackTransaction();
        
        return {
          message: `¡El cargue ha terminado! -> ${error.message || 'Error desconocido'}`,      
          status: false,
          inserted: [],
          duplicated: duplicateStates,
          existing:syncronizedStates
        };
      } finally {
        await queryRunner.release();
      }
    }


/** ✅
   * Retorna todas lass departamentos que el usuario no tiene sincronizados
   */
  async getAllStates(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    status:boolean,
    states:State[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncStates = await entityManager
      .createQueryBuilder()
      .select('departamentos.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.departamentos`, 'departamentos')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(departamentos.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();

      await queryRunner.commitTransaction();

      return {
        message:
          'Conexión exitosa, se han obtenido los siguientes departamentos no sincronizados:',
        status:true,
        states: notSyncStates
      };
    } catch (error) {
      
      await queryRunner.rollbackTransaction();
      
      return {
        message: `¡Error en la conexión, retornando desde la base de datos!! ->  ${error.message || 'Error desconocido'}`, 
        status:false,
        states: []
      };
    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   *  Actualiza los registros sincronizados en el mobil
  */
  async syncStates(
    schema: string,
    uuid_authsupa: string,
    statesArrayFiltred:  { uniqueStates: StateDto[]; duplicateStates: StateDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    syncronized: StateDto[],
    duplicated: StateDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const syncronized : StateDto[] = [];

    try {
      const entityManager = queryRunner.manager;      
  
      if(statesArrayFiltred.uniqueStates.length>0){ 
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingStates = await entityManager
        .createQueryBuilder()
        .select("departamentos.*")
        .from(`${schema}.departamentos`, "departamentos")
        .where("departamentos.id_departamento IN (:...id_departamentos)", {
          id_departamentos: statesArrayFiltred.uniqueStates.map((tc) => tc.id_departamento.toString()),
      })
      .getRawMany();
  
      for (const state of statesArrayFiltred.uniqueStates) {        

        const existingState= existingStates.find(
          (c) => c.id_departamento.localeCompare(state.id_departamento, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingState) {
          let syncWithArray = existingState.sync_with 
          ? (typeof existingState.sync_with === "string" 
              ? JSON.parse(existingState.sync_with) 
              : existingState.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: existingState.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.departamentos`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("id_departamento = :id_departamento", { id_departamento: existingState.id_departamento })
              .execute();
            
              syncronized.push({ ...existingState });
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
        duplicated: statesArrayFiltred.duplicateStates,
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();

      return {
        message: `¡La Sincronización ha terminado, retornando desde syncStates !! -> ${error.message || 'Error desconocido'}`, 
        status: false,
        syncronized:syncronized,
        duplicated: statesArrayFiltred.duplicateStates,
      };
    } finally {

      await queryRunner.release();

    }
  }


};
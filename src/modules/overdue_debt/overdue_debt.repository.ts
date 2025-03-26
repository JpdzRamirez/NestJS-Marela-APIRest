import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between,QueryFailedError  } from 'typeorm';
import { OverdueDebt } from './overdue_debt.entity';

import { OverdueDebtDto } from './dto/overdue_debt.dto';

@Injectable()
export class OverdueDebtRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los moras y retorna los moras insertados o duplicados
     */
    async submitAllOverdueDebt(
      schema: string, 
      overdueDebtArrayFiltred: { uniqueOverdueDebt: OverdueDebt[]; duplicateOverdueDebt: OverdueDebtDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_mora: string;
        nombre_mora: string;        
      }[];
      duplicated: OverdueDebtDto[]; 
      existing:OverdueDebtDto[];
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const insertedOverdueDebts: { 
        id: number; 
        id_mora: string;
        nombre_mora: string;                
       }[] = [];
      const duplicateOverdueDebt=overdueDebtArrayFiltred.duplicateOverdueDebt;
      //moras ya presentes en la base de datos
      const syncronizedOverdueDebt: OverdueDebtDto[] = [];
      const uniqueFilteredOverdueDebt = new Map<string, OverdueDebt>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener moras que ya existen en la base de datos
        const existingOverDueDebts= await entityManager
        .createQueryBuilder()
        .select(['id','id_mora' ,'nombre_mora'])
        .from(`${schema}.moras`, 'moras')
        .where("moras.id_mora IN (:...id_moras)", {
            id_moras: overdueDebtArrayFiltred.uniqueOverdueDebt.map((tc) => tc.id_mora.toString()),
        })
        .getRawMany();

        for (const overdueDebt of overdueDebtArrayFiltred.uniqueOverdueDebt) {
        
            const referenceKey = overdueDebt.id_mora.toString().trim();
        
              if (existingOverDueDebts.some((ovrdt) => ovrdt.id_mora === ovrdt.id_mora)) {
                let duplicatedDBOverDueDebt:OverdueDebtDto = {
                      id:overdueDebt.id,
                      id_mora:overdueDebt.id_mora,
                      nombre_mora:overdueDebt.nombre_mora,                                                                    
                      mora_maxima:overdueDebt.mora_maxima!,
                      tipo_mora:overdueDebt.tipo_mora!,
                      valor_unitario:overdueDebt.valor_unitario,
                      factura_id:overdueDebt.factura_id,
                      contrato_id:overdueDebt.contrato_id,
                      source_failure:'DataBase'
                  };
                  syncronizedOverdueDebt.push({ ...duplicatedDBOverDueDebt }); // Guardar duplicado
              }else {
                uniqueFilteredOverdueDebt.set(referenceKey, { ...overdueDebt });
              }
        }
        if (uniqueFilteredOverdueDebt.size  > 0) {
        // 🔥 Insertar las moras con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.moras`, [
            'id_mora',
            'nombre_mora',
            'mora_maxima',              
            'tipo_mora', 
            'valor_unitario', 
            'factura_id', 
            'contrato_id', 
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueFilteredOverdueDebt.values()).map((ovrdt) => ({
              id_mora: ovrdt.id_mora,              
              nombre_mora: ovrdt.nombre_mora,
              mora_maxima: ovrdt.mora_maxima,    
              tipo_mora: ovrdt.tipo_mora,    
              valor_unitario: ovrdt.valor_unitario,    
              factura_id: ovrdt.factura_id,    
              contrato_id: ovrdt.contrato_id,    
              uploaded_by_authsupa: ovrdt.uploaded_by_authsupa,                                  
              sync_with: () => `'${JSON.stringify(ovrdt.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_ciudad", "nombre","codigo"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedOverdueDebts.push(
          ...Array.from(uniqueFilteredOverdueDebt.values()).map((ovrdt) => ({
            id: ovrdt.id, 
            id_mora: ovrdt.id_mora,
            nombre_mora:ovrdt.nombre_mora            
          }))
        );       
        
        }

        await queryRunner.commitTransaction();

        if(uniqueFilteredOverdueDebt.size === 0){                      
          return {
            message: "¡El cargue ha terminado! no hay datos pendientes por sincronizar",        
            status: false,
            inserted: [],
            duplicated: duplicateOverdueDebt,
            existing:syncronizedOverdueDebt
          };
        }

        return {
          message: "Cargue exitoso, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedOverdueDebts, 
          duplicated: duplicateOverdueDebt,
          existing:syncronizedOverdueDebt
        };
      } catch (error) {

        await queryRunner.rollbackTransaction();                
             
        if (error instanceof HttpException) {
          throw error;
        } else if (error instanceof QueryFailedError) {
          const message = error.message.toLowerCase();

            if (message.includes('duplicate key value')) {
              throw new HttpException('Registro duplicado', HttpStatus.CONFLICT); // 409
            }
            
            if (message.includes('foreign key constraint')) {
              throw new HttpException('Error de integridad referencial', HttpStatus.BAD_REQUEST); // 400
            }

            if (message.includes('not-null constraint')) {
              throw new HttpException('Campo obligatorio no puede estar vacío', HttpStatus.BAD_REQUEST); // 400
            }

            if (message.includes('syntax error')) {
              throw new HttpException('Error en la consulta SQL', HttpStatus.INTERNAL_SERVER_ERROR); // 500
            }

            if (message.includes('connection refused')) {
              throw new HttpException('Error de conexión con la base de datos', HttpStatus.SERVICE_UNAVAILABLE); // 503
            }

            throw new HttpException(`Error en la base de datos: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR); // 500 por defecto
        } else {
          throw new HttpException(`Error inesperado: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

      } finally {
        await queryRunner.release();
      }
    }


/** ✅
   * Retorna todas lass moras que el usuario no tiene sincronizados
   */
  async getAllOverdueDebt(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    status:boolean,
    overdue_debts:OverdueDebt[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncOverdueDebts = await entityManager
      .createQueryBuilder()
      .select('moras.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.ciudades`, 'moras')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(moras.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();
      
      if(notSyncOverdueDebts.length ===0){
        return {
          message: `¡Proceso finalizado, no existen registros pendientes por sincronizar!!`,
          status:false,
          overdue_debts: []
        };
      }

      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes ciudades no sincronizados:',
          status:true,
          overdue_debts: notSyncOverdueDebts
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();


      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof QueryFailedError) {
        const message = error.message.toLowerCase();

          if (message.includes('duplicate key value')) {
            throw new HttpException('Registro duplicado', HttpStatus.CONFLICT); // 409
          }
          
          if (message.includes('foreign key constraint')) {
            throw new HttpException('Error de integridad referencial', HttpStatus.BAD_REQUEST); // 400
          }

          if (message.includes('not-null constraint')) {
            throw new HttpException('Campo obligatorio no puede estar vacío', HttpStatus.BAD_REQUEST); // 400
          }

          if (message.includes('syntax error')) {
            throw new HttpException('Error en la consulta SQL', HttpStatus.INTERNAL_SERVER_ERROR); // 500
          }

          if (message.includes('connection refused')) {
            throw new HttpException('Error de conexión con la base de datos', HttpStatus.SERVICE_UNAVAILABLE); // 503
          }

          throw new HttpException(`Error en la base de datos: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR); // 500 por defecto
      } else {
        throw new HttpException(`Error inesperado: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   *  Actualiza los registros sincronizados en el mobil
   */
  async syncOverdueDebt(
    schema: string,
    uuid_authsupa: string,
    overdueDebtArrayFiltred:  { uniqueOverdueDebt: OverdueDebtDto[]; duplicateOverdueDebt: OverdueDebtDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    syncronized: OverdueDebtDto[],
    duplicated: OverdueDebtDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const syncronized : OverdueDebtDto[] = [];
  
    try {
      const entityManager = queryRunner.manager;      
  
      if(overdueDebtArrayFiltred.uniqueOverdueDebt.length>0){ 
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingOverdueDebts = await entityManager
        .createQueryBuilder()
        .select("moras.*")
        .from(`${schema}.moras`, "moras")
        .where("moras.id_mora IN (:...id_moras)", {
          id_moras: overdueDebtArrayFiltred.uniqueOverdueDebt.map((tc) => tc.id_mora.toString()),
      })
      .getRawMany();
  
      for (const overdueDebt of overdueDebtArrayFiltred.uniqueOverdueDebt) {
        const existingOverdueDebt= existingOverdueDebts.find(
          (c) => c.id_mora.localeCompare(overdueDebt.id_mora, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingOverdueDebt) {
          let syncWithArray = existingOverdueDebt.sync_with 
          ? (typeof existingOverdueDebt.sync_with === "string" 
              ? JSON.parse(existingOverdueDebt.sync_with) 
              : existingOverdueDebt.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: existingOverdueDebt.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.moras`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("id_mora = :id_mora", { id_mora: existingOverdueDebt.id_mora })
              .execute();

              syncronized.push({ ...existingOverdueDebt });
          }
        }
      }      
      }
      if(syncronized.length ===0){
        return {
          message: `¡La Sincronización ha terminado, la base de datos ya se encuentra sincronizada!!`,
          status: false,
          syncronized:syncronized,
          duplicated: overdueDebtArrayFiltred.duplicateOverdueDebt,
        };
      }
        
      await queryRunner.commitTransaction();

      return {
        message: "Sincronización exitosa, se han obtenido los siguientes resultados",
        status: true,
        syncronized:syncronized,
        duplicated: overdueDebtArrayFiltred.duplicateOverdueDebt,
      };
    } catch (error) {
      
      await queryRunner.rollbackTransaction();  
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof QueryFailedError) {
        const message = error.message.toLowerCase();

          if (message.includes('duplicate key value')) {
            throw new HttpException('Registro duplicado', HttpStatus.CONFLICT); // 409
          }
          
          if (message.includes('foreign key constraint')) {
            throw new HttpException('Error de integridad referencial', HttpStatus.BAD_REQUEST); // 400
          }

          if (message.includes('not-null constraint')) {
            throw new HttpException('Campo obligatorio no puede estar vacío', HttpStatus.BAD_REQUEST); // 400
          }

          if (message.includes('syntax error')) {
            throw new HttpException('Error en la consulta SQL', HttpStatus.INTERNAL_SERVER_ERROR); // 500
          }

          if (message.includes('connection refused')) {
            throw new HttpException('Error de conexión con la base de datos', HttpStatus.SERVICE_UNAVAILABLE); // 503
          }

          throw new HttpException(`Error en la base de datos: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR); // 500 por defecto
      } else {
        throw new HttpException(`Error inesperado: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } finally {
      await queryRunner.release();
    }
  }


};
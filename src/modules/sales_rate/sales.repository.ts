import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between,QueryFailedError } from 'typeorm';
import { SalesRate } from './sales_rate.entity';

import { SalesDto } from './dto/sales.dto';

@Injectable()
export class SalesRateRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los tarifas y retorna los tarifas insertados o duplicados
     */
    async submitAllSalesRate(
      schema: string, 
      salesRateArrayFiltred: { uniqueSalesRate: SalesRate[]; duplicateSalesRate: SalesDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_tarifa: string;
        nombre: string }[];
      duplicated: SalesDto[]; 
      existing:SalesDto[];
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();      

      const insertedSalesRate: { 
        id: number; 
        id_tarifa: string;
        nombre: string;        
       }[] = [];
      const duplicateMunicipalUnits=salesRateArrayFiltred.duplicateSalesRate;
      const syncronizedSalesDate: SalesDto[] = [];
      const uniqueFilteredSalesRate = new Map<string, SalesRate>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener tarifas que ya existen en la base de datos
        const existingSalesRate= await entityManager
        .createQueryBuilder()
        .select(['id','id_tarifa', 'nombre'])
        .from(`${schema}.tarifas`, 'tarifas')
        .where('tarifas.id_tarifa IN (:...id_tarifas)', {
            id_tarifas: salesRateArrayFiltred.uniqueSalesRate.map((tc) => tc.id_tarifa.toString()),
        })
        .getRawMany();

        for (const salesrate of salesRateArrayFiltred.uniqueSalesRate) {
        
            const referenceKey = salesrate.id_tarifa.toString().trim();
        
              if (existingSalesRate.some((slrt) => slrt.id_tarifa === salesrate.id_tarifa)) {
                let duplicatedDBSalesRate:SalesDto = {
                      id:salesrate.id,
                      id_tarifa:salesrate.id_tarifa,
                      nombre:salesrate.nombre,                    
                      tiposervicio_id:salesrate.tipo_servicio.id_tiposervicio, 
                      rango_inicial:salesrate.rango_inicial, 
                      rango_final:salesrate.rango_final, 
                      source_failure:'DataBase'
                  };
                  syncronizedSalesDate.push({ ...duplicatedDBSalesRate }); // Guardar duplicado
              }else {
                uniqueFilteredSalesRate.set(referenceKey, { ...salesrate });
              }
        }
        if (uniqueFilteredSalesRate.size  > 0) {
        // 🔥 Insertar los tarifas con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.tarifas`, [
            'id_tarifa',
            'nombre',
            'tiposervicio_id', 
            'rango_inicial', 
            'rango_final',
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueFilteredSalesRate.values()).map((srt) => ({
              id_tarifa: srt.id_tarifa,              
              nombre: srt.nombre,
              tiposervicio_id: srt.tipo_servicio.id_tiposervicio,          
              rango_inicial: srt.rango_inicial,                   
              rango_final: srt.rango_final,    
              uploaded_by_authsupa: srt.uploaded_by_authsupa,
              sync_with: () => `'${JSON.stringify(srt.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_tarifa", "nombre"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedSalesRate.push(
          ...Array.from(uniqueFilteredSalesRate.values()).map((srt) => ({
            id: srt.id, 
            id_tarifa: srt.id_tarifa,
            nombre:srt.nombre,
          }))
        );       
        
        }

        await queryRunner.commitTransaction();

        if(uniqueFilteredSalesRate.size === 0){                      
          return {
            message: "¡El cargue ha terminado! no hay datos pendientes por sincronizar",        
            status: false,
            inserted: [],
            duplicated: duplicateMunicipalUnits,
            existing:syncronizedSalesDate
          };
        }

        return {
          message: "Cargue exitoso, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedSalesRate, 
          duplicated: duplicateMunicipalUnits,
          existing:syncronizedSalesDate
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
   * Retorna todas lass tarifas que el usuario no tiene sincronizados
  */
  async getAllSalesRate(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    status:boolean,
    sales_rate:SalesRate[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncSalesRate = await entityManager
      .createQueryBuilder()
      .select('tarifas.*') 
      .from(`${schema}.tarifas`, 'tarifas')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(tarifas.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      if(notSyncSalesRate.length ===0){
        return {
          message: `¡Proceso finalizado, no existen registros pendientes por sincronizar!!`,
          status:false,
          sales_rate: []
        };
      }

      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes tarifas no sincronizados:',
        status:true,
        sales_rate: notSyncSalesRate
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
  async syncSalesRate(
    schema: string,
    uuid_authsupa: string,
    salesRateArrayFiltred:  { uniqueSalesRate: SalesDto[]; duplicateSalesRate: SalesDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    syncronized: SalesDto[],
    duplicated: SalesDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    const syncronized : SalesDto[] = [];

    try {
      const entityManager = queryRunner.manager;      
      
      if(salesRateArrayFiltred.uniqueSalesRate.length>0){  
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingSalesRate = await entityManager
        .createQueryBuilder()
        .select("tarifas.*")
        .from(`${schema}.tarifas`, "tarifas")
        .where("tarifas.id_tarifa IN (:...id_tarifas)", {
            id_tarifas: salesRateArrayFiltred.uniqueSalesRate.map((tc) => tc.id_tarifa.toString()),
      })
      .getRawMany();
  
      for (const salerate of salesRateArrayFiltred.uniqueSalesRate) {
        const existingSaleRate= existingSalesRate.find(
          (c) => c.id_tarifa.localeCompare(salerate.id_tarifa, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingSaleRate) {
          let syncWithArray = existingSaleRate.sync_with 
          ? (typeof existingSaleRate.sync_with === "string" 
              ? JSON.parse(existingSaleRate.sync_with) 
              : existingSaleRate.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: salerate.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.tarifas`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) 
              .where("id_tarifa = :id_tarifa", { id_tarifa: existingSaleRate.id_tarifa })
              .execute();

              syncronized.push({ ...existingSaleRate });
          }
        }
      }      
      }
      
      if(syncronized.length ===0){
        return {
          message: `¡La Sincronización ha terminado, la base de datos ya se encuentra sincronizada!!`,
          status: false,
          syncronized:syncronized,
          duplicated: salesRateArrayFiltred.duplicateSalesRate,
        };
      }

      await queryRunner.commitTransaction();

      return {
        message: "Sincronización exitosa, se han obtenido los siguientes resultados",
        status: true,
        syncronized:syncronized,
        duplicated: salesRateArrayFiltred.duplicateSalesRate,
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
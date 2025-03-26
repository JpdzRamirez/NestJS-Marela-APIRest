import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between,QueryFailedError } from 'typeorm';
import { City } from './city.entity';

import { CityDto } from './dto/cities.dto';

@Injectable()
export class CityRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los clientes y retorna los clientes insertados o duplicados
     */
    async submitAllCities(
      schema: string, 
      citiesArrayFiltred: { uniqueCities: City[]; duplicateCities: CityDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_ciudad: string;
        nombre: string;
        codigo: number;
      }[];
      duplicated: CityDto[]; 
      existing:CityDto[];
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const insertedCities: { 
        id: number; 
        id_ciudad: string;
        nombre: string;        
        codigo: number;  
       }[] = [];
      const duplicateCities=citiesArrayFiltred.duplicateCities;
      //Ciudades ya presentes en la base de datos
      const syncronizedCities: CityDto[] = [];
      const uniqueFilteredCities = new Map<string, City>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener ciudades que ya existen en la base de datos
        const existingCities= await entityManager
        .createQueryBuilder()
        .select(['id','id_ciudad' ,'nombre'])
        .from(`${schema}.ciudades`, 'ciudades')
        .where("ciudades.id_ciudad IN (:...id_ciudades)", {
          id_ciudades: citiesArrayFiltred.uniqueCities.map((tc) => tc.id_ciudad.toString()),
        })
        .getRawMany();

        for (const city of citiesArrayFiltred.uniqueCities) {
        
            const referenceKey = city.nombre.toString().trim();
        
              if (existingCities.some((cty) => cty.id_ciudad === city.id_ciudad)) {
                let duplicatedDBCity:CityDto = {
                      id:city.id,
                      id_ciudad:city.id_ciudad,
                      nombre:city.nombre,                                                                  
                      codigo:city.codigo,     
                      source_failure:'DataBase'
                  };
                  syncronizedCities.push({ ...duplicatedDBCity }); // Guardar duplicado
              }else {
                uniqueFilteredCities.set(referenceKey, { ...city });
              }
        }
        if (uniqueFilteredCities.size  > 0) {
        // 🔥 Insertar las ciudades con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.ciudades`, [
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
        
        }

        await queryRunner.commitTransaction();

        if(uniqueFilteredCities.size === 0){                      
          return {
            message: "¡El cargue ha terminado! no hay datos pendientes por sincronizar",        
            status: false,
            inserted: [],
            duplicated: duplicateCities,
            existing:syncronizedCities
          };
        }

        return {
          message: "Cargue exitoso, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedCities, 
          duplicated: duplicateCities,
          existing:syncronizedCities
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
   * Retorna todas lass ciudades que el usuario no tiene sincronizados
   */
  async getAllCities(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    status:boolean,
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

      if(notSyncCities.length ===0){
        return {
          message: `¡Proceso finalizado, no existen registros pendientes por sincronizar!!`,
          status:false,
          cities: []
        };
      }
      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes ciudades no sincronizados:',
          status:true,
          cities: notSyncCities
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
  async syncCities(
    schema: string,
    uuid_authsupa: string,
    citiesArrayFiltred:  { uniqueCities: CityDto[]; duplicateCities: CityDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    syncronized: CityDto[],
    duplicated: CityDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const syncronized : CityDto[] = [];
  
    try {
      const entityManager = queryRunner.manager;      
  
      if(citiesArrayFiltred.uniqueCities.length>0){ 
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingCities = await entityManager
        .createQueryBuilder()
        .select("ciudades.*")
        .from(`${schema}.ciudades`, "ciudades")
        .where("ciudades.id_ciudad IN (:...id_ciudades)", {
          id_ciudades: citiesArrayFiltred.uniqueCities.map((tc) => tc.id_ciudad.toString()),
      })
      .getRawMany();
  
      for (const city of citiesArrayFiltred.uniqueCities) {
        const existingCity= existingCities.find(
          (c) => c.id_ciudad.localeCompare(city.id_ciudad, undefined, { sensitivity: "base" }) === 0
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

              syncronized.push({ ...existingCity });
          }
        }
      }      
      }
      if(syncronized.length ===0){
        return {
          message: `¡La Sincronización ha terminado, la base de datos ya se encuentra sincronizada!!`,
          status: false,
          syncronized:syncronized,
          duplicated: citiesArrayFiltred.duplicateCities,
        };
      }
        
      await queryRunner.commitTransaction();

      return {
        message: "Sincronización exitosa, se han obtenido los siguientes resultados",
        status: true,
        syncronized:syncronized,
        duplicated: citiesArrayFiltred.duplicateCities,
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
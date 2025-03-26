import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between,QueryFailedError } from 'typeorm';
import { Brand } from './brand.entity';

import { BrandDto } from './dto/brand.dto';

@Injectable()
export class BrandRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los marcas y retorna los marcas insertados o duplicados
     */
    async submitAllBrands(
      schema: string, 
      brandsArrayFiltred: { uniqueBrands: Brand[]; duplicateBrands: BrandDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_marca: string;
        nombre: string;        
      }[];
      duplicated: BrandDto[]; 
      existing:BrandDto[];
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      

      const insertedBrands: { 
        id: number; 
        id_marca: string;
        nombre: string;                
       }[] = [];
      const duplicateBrands=brandsArrayFiltred.duplicateBrands; 
      const syncronizedBrands: BrandDto[] = [];     
      try {
        const entityManager = queryRunner.manager;
        
        const normalizedNewTypeDocuments = brandsArrayFiltred.uniqueBrands.map((brnd) => ({
            ...brnd,
            nombre: brnd.nombre
              .trim()
              .toLowerCase()
              .replace(/\s+/g, " ")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, ""), // Quitar acentos y espacios innecesarios
        }));

        // 🔥 Obtener marcas que ya existen en la base de datos
        const existingBrands= await entityManager
        .createQueryBuilder()
        .select(['id', 'nombre'])
        .from(`${schema}.marcas`, 'marcas')
        .where("LOWER(unaccent(marcas.nombre)) IN (:...nombres)", {
          nombres: normalizedNewTypeDocuments.map((brnd) => brnd.nombre.toString()),
        })
        .getRawMany();

        // 🔥 Normalizar nombres existentes para comparación eficiente
        const existingNames = new Set(
            existingBrands.map((brand) =>
            brand.nombre
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            )
        );
        
        // 🔥 Filtrar solo las marcas que no están duplicadas
        const uniqueBrands = brandsArrayFiltred.uniqueBrands.filter((brnd) => {
            const normalizedName = brnd.nombre
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

            if (existingNames.has(normalizedName)) {
            let existingBrand = existingBrands.find(
                (c) => c.nombre.localeCompare(brnd.nombre, undefined, { sensitivity: "base" }) === 0
            );

            if (existingBrand) {
                existingBrand.id=brnd.id;
                existingBrand.source_failure='DataBase';
                syncronizedBrands.push(existingBrand);
                return false;
            }
            }
            return true;
        });
        if (uniqueBrands.length  > 0) {
        // 🔥 Insertar los marcas con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.marcas`, [
            'id_ciudad',
            'nombre',
            'codigo',              
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueBrands.values()).map((brnd) => ({
              id_marca: brnd.id_marca,              
              nombre: brnd.nombre,              
              uploaded_by_authsupa: brnd.uploaded_by_authsupa,                                  
              sync_with: () => `'${JSON.stringify(brnd.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_marca", "nombre"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedBrands.push(
          ...Array.from(uniqueBrands.values()).map((brnd) => ({
            id: brnd.id, 
            id_marca: brnd.id_marca,
            nombre:brnd.nombre,           
          }))
        );       
        
        }
        
        await queryRunner.commitTransaction();

        if(uniqueBrands.length === 0){                      
          return {
            message: "¡El cargue ha terminado! no hay datos pendientes por sincronizar",        
            status: false,
            inserted: [],
            duplicated: duplicateBrands,
            existing:syncronizedBrands
          };
        }
        
        return {
          message: "Cargue exitoso, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedBrands, 
          duplicated: duplicateBrands,
          existing:syncronizedBrands
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
   * Retorna todas lass marcas que el usuario no tiene sincronizados
   */
  async getAllBrands(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    status:boolean,
    brands:Brand[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncBrands = await entityManager
      .createQueryBuilder()
      .select('marcas.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.marcas`, 'marcas')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(marcas.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      if(notSyncBrands.length ===0){
        return {
          message: `¡Proceso finalizado, no existen registros pendientes por sincronizar!!`,
          status:false,
          brands: []
        };
      }
      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes marcas no sincronizados:',
        status:true,
        brands: notSyncBrands
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
  async syncBrands(
    schema: string,
    uuid_authsupa: string,
    brandsArrayFiltred:  { uniqueBrands: BrandDto[]; duplicateBrands: BrandDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    syncronized: BrandDto[],
    duplicated: BrandDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const syncronized : BrandDto[] = [];
  
    try {
      const entityManager = queryRunner.manager;      
  
      if(brandsArrayFiltred.uniqueBrands.length>0){ 
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingBrands = await entityManager
        .createQueryBuilder()
        .select("marcas.*")
        .from(`${schema}.marcas`, "marcas")
        .where("marcas.id_marca IN (:...id_marcas)", {
          id_marcas: brandsArrayFiltred.uniqueBrands.map((brnd) => brnd.id_marca.toString()),
      })
      .getRawMany();
  
      for (const brand of brandsArrayFiltred.uniqueBrands) {
        const existingBrand= existingBrands.find(
          (c) => c.id_marca.localeCompare(brand.id_marca, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingBrand) {
          let syncWithArray = existingBrand.sync_with 
          ? (typeof existingBrand.sync_with === "string" 
              ? JSON.parse(existingBrand.sync_with) 
              : existingBrand.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: existingBrand.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.marcas`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("id_marca = :id_marca", { id_marca: existingBrand.id_marca })
              .execute();

              syncronized.push({ ...existingBrand });
          }
        }
      }       
      }

      if(syncronized.length ===0){
        return {
            message: `¡La Sincronización ha terminado, la base de datos ya se encuentra sincronizada!!`,
            status: false,
            syncronized:syncronized,
            duplicated: brandsArrayFiltred.duplicateBrands,
          };
      }

      await queryRunner.commitTransaction();

      return {
        message: "Sincronización exitosa, se han obtenido los siguientes resultados",
        status: true,
        syncronized:syncronized,
        duplicated: brandsArrayFiltred.duplicateBrands,
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
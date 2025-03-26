import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between,QueryFailedError } from 'typeorm';
import { ProductsActivity } from './products_activity.entity';

import { ProductsActivityDto } from './dto/products_activity.dto';

@Injectable()
export class ProductsActivityRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los productos actividad insertados o duplicados
     */
    async submitAllProductsActivity(
      schema: string, 
      productsArrayArrayFiltred: { uniqueProductsActivity: ProductsActivity[]; duplicateProductsActivity: ProductsActivityDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_productosactividad: string;
        nombre: string;
        codigo: number;
      }[];
      duplicated: ProductsActivityDto[]; 
      existing:ProductsActivityDto[];
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const insertedProductsActivity: { 
        id: number; 
        id_productosactividad: string;
        nombre: string;        
        codigo: number;  
       }[] = [];
      const duplicateProductsActivity=productsArrayArrayFiltred.duplicateProductsActivity;
      //Ciudades ya presentes en la base de datos
      const syncronizedProductsActivity: ProductsActivityDto[] = [];
      const uniqueFilteredProductsActivity = new Map<string, ProductsActivity>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener ciudades que ya existen en la base de datos
        const existingCities= await entityManager
        .createQueryBuilder()
        .select(['id','id_productosactividad' ,'nombre'])
        .from(`${schema}.productos_actividad`, 'productos_actividad')
        .where("productos_actividad.id_productosactividad IN (:...id_productosactividades)", {
            id_productosactividades: productsArrayArrayFiltred.uniqueProductsActivity.map((tc) => tc.id_productosactividad.toString()),
        })
        .getRawMany();

        for (const ProductActivity of productsArrayArrayFiltred.uniqueProductsActivity) {
        
            const referenceKey = ProductActivity.nombre.toString().trim();
        
              if (existingCities.some((cty) => cty.id_productosactividad === ProductActivity.id_productosactividad)) {
                let duplicatedDBCity:ProductsActivityDto = {
                      id:ProductActivity.id,
                      id_productosactividad:ProductActivity.id_productosactividad,
                      nombre:ProductActivity.nombre,                                                                  
                      codigo:ProductActivity.codigo, 
                      stock: ProductActivity.stock, 
                      precio_venta: ProductActivity.precio_venta!, 
                      descripcion: ProductActivity.descripcion!, 
                      manejo_stock: ProductActivity.manejo_stock, 
                      producto_venta: ProductActivity.producto_venta, 
                      unidad_id: ProductActivity.unidad_id, 
                      actividad_id: ProductActivity.actividad_id!,     
                      source_failure:'DataBase'
                  };
                  syncronizedProductsActivity.push({ ...duplicatedDBCity }); // Guardar duplicado
              }else {
                uniqueFilteredProductsActivity.set(referenceKey, { ...ProductActivity });
              }
        }
        if (uniqueFilteredProductsActivity.size  > 0) {
        // 🔥 Insertar las ciudades con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.productos_actividad`, [
            'id_productosactividad',
            'nombre',
            'codigo',              
            'stock',
            'precio_venta',
            'descripcion',
            'manejo_stock',
            'producto_venta',
            'unidad_id',            
            'actividad_id',   
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueFilteredProductsActivity.values()).map((prodact) => ({
              id_productosactividad: prodact.id_productosactividad,              
              nombre: prodact.nombre,
              codigo: prodact.codigo,    
              stock: prodact.stock, 
              precio_venta: prodact.precio_venta, 
              descripcion: prodact.descripcion, 
              manejo_stock: prodact.manejo_stock, 
              producto_venta: prodact.producto_venta, 
              unidad_id: prodact.unidad_id, 
              actividad_id: prodact.actividad_id, 
              uploaded_by_authsupa: prodact.uploaded_by_authsupa,                                  
              sync_with: () => `'${JSON.stringify(prodact.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_productosactividad", "nombre","codigo"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedProductsActivity.push(
          ...Array.from(uniqueFilteredProductsActivity.values()).map((prodact) => ({
            id: prodact.id, 
            id_productosactividad: prodact.id_productosactividad,
            nombre:prodact.nombre,
            codigo:prodact.codigo,
          }))
        );       
        
        }

        await queryRunner.commitTransaction();

        if(uniqueFilteredProductsActivity.size === 0){                      
          return {
            message: "¡El cargue ha terminado! no hay datos pendientes por sincronizar",        
            status: false,
            inserted: [],
            duplicated: duplicateProductsActivity,
            existing:syncronizedProductsActivity
          };
        }

        return {
          message: "Cargue exitoso, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedProductsActivity, 
          duplicated: duplicateProductsActivity,
          existing:syncronizedProductsActivity
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
   * Retorna todas lass productos de actividad que el usuario no tiene sincronizados
   */
  async getAllProductsActivity(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    status:boolean,
    products_activity:ProductsActivity[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncProductsActivity = await entityManager
      .createQueryBuilder()
      .select('productos_actividad.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.productos_actividad`, 'productos_actividad')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(productos_actividad.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      if(notSyncProductsActivity.length ===0){
        return {
          message: `¡Proceso finalizado, no existen registros pendientes por sincronizar!!`,
          status:false,
          products_activity: []
        };
      }

      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes ciudades no sincronizados:',
          status:true,
          products_activity: notSyncProductsActivity
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
  async syncProductsActivity(
    schema: string,
    uuid_authsupa: string,
    productsActivityArrayFiltred:  { uniqueProductsActivity: ProductsActivityDto[]; duplicateProductsActivity: ProductsActivityDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    syncronized: ProductsActivityDto[],
    duplicated: ProductsActivityDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const syncronized : ProductsActivityDto[] = [];
  
    try {
      const entityManager = queryRunner.manager;      
  
      if(productsActivityArrayFiltred.uniqueProductsActivity.length>0){ 
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingProductsActivity = await entityManager
        .createQueryBuilder()
        .select("productos_actividad.*")
        .from(`${schema}.productos_actividad`, "productos_actividad")
        .where("productos_actividad.id_productosactividad IN (:...id_productosactividades)", {
            id_productosactividades: productsActivityArrayFiltred.uniqueProductsActivity.map((tc) => tc.id_productosactividad.toString()),
      })
      .getRawMany();
  
      for (const productActivity of productsActivityArrayFiltred.uniqueProductsActivity) {
        const existingProductActivity= existingProductsActivity.find(
          (c) => c.id_productosactividad.localeCompare(productActivity.id_productosactividad, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingProductActivity) {
          let syncWithArray = existingProductActivity.sync_with 
          ? (typeof existingProductActivity.sync_with === "string" 
              ? JSON.parse(existingProductActivity.sync_with) 
              : existingProductActivity.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: existingProductActivity.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.productos_actividad`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("id_productosactividad = :id_productosactividad", { id_productosactividad: existingProductActivity.id_productosactividad })
              .execute();

              syncronized.push({ ...existingProductActivity });
          }
        }
      }      
      }
      if(syncronized.length ===0){
        return {
          message: `¡La Sincronización ha terminado, la base de datos ya se encuentra sincronizada!!`,
          status: false,
          syncronized:syncronized,
          duplicated: productsActivityArrayFiltred.duplicateProductsActivity,
        };
      }
        
      await queryRunner.commitTransaction();

      return {
        message: "Sincronización exitosa, se han obtenido los siguientes resultados",
        status: true,
        syncronized:syncronized,
        duplicated: productsActivityArrayFiltred.duplicateProductsActivity,
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
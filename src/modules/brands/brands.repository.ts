import { Injectable } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { Brand } from './brand.entity';

import { BrandDto } from './dto/brand.dto';

@Injectable()
export class BrandRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los clientes y retorna los clientes insertados o duplicados
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
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      let messageResponse='';

      const insertedBrands: { 
        id: number; 
        id_marca: string;
        nombre: string;                
       }[] = [];
      const duplicateBrands=brandsArrayFiltred.duplicateBrands;      
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

        // 🔥 Obtener clientes que ya existen en la base de datos
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
                duplicateBrands.push(existingBrand);
                return false;
            }
            }
            return true;
        });
        if (uniqueBrands.length  > 0) {
        // 🔥 Insertar los clientes con el esquema dinámico
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
        messageResponse="Cargue exitoso, se han obtenido los siguientes resultados:";
        }else{
          messageResponse = "La base de datos ya se encuentra sincronizada; Datos ya presentes en BD";                
          throw new Error(messageResponse);
        }

        await queryRunner.commitTransaction();

        return {
          message: messageResponse,
          status: true,
          inserted: insertedBrands, 
          duplicated: duplicateBrands,
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ Error en submitAllCities:", error);
        
        return {
          message: "¡El cargue ha terminado! -> "+ error.message,        
          status: false,
          inserted: [],
          duplicated: duplicateBrands
        };
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

      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes marcas no sincronizados:',
        brands: notSyncBrands
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en getAllCities:', error);
      return {
        message: "¡Error en la conexión, retornando desde la base de datos!! -> "+ error.message, 
        brands: []
      };
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
    duplicated: BrandDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let messageResponse='';
  
    try {
      const entityManager = queryRunner.manager;      
  
      if(brandsArrayFiltred.uniqueBrands.length>0){ 
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingBrands = await entityManager
        .createQueryBuilder()
        .select("marcas.*")
        .from(`${schema}.marcas`, "marcas")
        .where("LOWER(unaccent(marcas.nombre)) IN (:...nombres)", {
          nombres: brandsArrayFiltred.uniqueBrands.map((brnd) => brnd.nombre.toString()),
      })
      .getRawMany();
  
      for (const brand of brandsArrayFiltred.uniqueBrands) {
        const existingBrand= existingBrands.find(
          (c) => c.nombre.localeCompare(brand.nombre, undefined, { sensitivity: "base" }) === 0
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
        duplicated: brandsArrayFiltred.duplicateBrands,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Error en syncCities:", error);
      return {
        message: "¡La Sincronización ha terminado, retornando desde la base de datos!! -> "+ error.message, 
        status: false,
        duplicated: brandsArrayFiltred.duplicateBrands,
      };
    } finally {
      await queryRunner.release();
    }
  }


};
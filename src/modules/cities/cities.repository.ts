import { Injectable } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
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
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      let messageResponse='';

      const insertedCities: { 
        id: number; 
        id_ciudad: string;
        nombre: string;        
        codigo: number;  
       }[] = [];
      const duplicateCities=citiesArrayFiltred.duplicateCities;
      const uniqueFilteredCities = new Map<string, City>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener clientes que ya existen en la base de datos
        const existingCities= await entityManager
        .createQueryBuilder()
        .select(['id', 'nombre'])
        .from(`${schema}.ciudades`, 'ciudades')
        .where("LOWER(unaccent(ciudades.nombre)) IN (:...nombres)", {
          nombres: citiesArrayFiltred.uniqueCities.map((tc) => tc.nombre.toString()),
        })
        .getRawMany();

        for (const city of citiesArrayFiltred.uniqueCities) {
        
            const referenceKey = city.nombre.toString().trim();
        
              if (existingCities.some((cty) => cty.nombre === city.nombre)) {
                let duplicatedDBCity:CityDto = {
                      id:city.id,
                      id_ciudad:city.id_ciudad,
                      nombre:city.nombre,                                                                  
                      codigo:city.codigo,     
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
          message: "¡El cargue ha terminado! -> "+ error.message,        
          status: false,
          inserted: [],
          duplicated: duplicateCities
        };
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
          'Conexión exitosa, se han obtenido las siguientes ciudades no sincronizados:',
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
  async syncCities(
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
        message: "¡La Sincronización ha terminado, retornando desde la base de datos!! -> "+ error.message, 
        status: false,
        duplicated: citiesArrayFiltred.duplicateCities,
      };
    } finally {
      await queryRunner.release();
    }
  }


};
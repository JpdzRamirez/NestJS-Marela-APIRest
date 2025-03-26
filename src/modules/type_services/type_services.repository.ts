import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { TypeService } from './type_service.entity';

import { TypeServiceDto } from './dto/type_services.dto';

@Injectable()
export class TypeServiceRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los tipos de servicio y retorna los clientes insertados o duplicados
     */
    async submitAllTypeServices(
      schema: string, 
      typeServicesArrayFiltred: { uniqueTypeServices: TypeService[]; duplicateTypeServices: TypeServiceDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_tiposervicio: string;
        nombre: string;   
        cargo_fijo: number;     
      }[];
      duplicated: TypeServiceDto[];
      existing:TypeServiceDto[]; 
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const insertedTypoServicio: { 
        id: number; 
        id_tiposervicio: string;
        nombre: string;                  
        cargo_fijo: number; 
       }[] = [];
      const duplicateTypeServices=typeServicesArrayFiltred.duplicateTypeServices;
      const syncronizedTypeServices: TypeServiceDto[] = [];
      const uniqueFilteredTypeServices = new Map<string, TypeService>();
      try {
        const entityManager = queryRunner.manager;
        
        const normalizedNewTypeServices = typeServicesArrayFiltred.uniqueTypeServices.map((tc) => ({
            ...tc,
            nombre: tc.nombre
              .trim()
              .toLowerCase()
              .replace(/\s+/g, " ")
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, ""), // Quitar acentos y espacios innecesarios
        }));

        // 🔥 Obtener clientes que ya existen en la base de datos
        const existingTypeServices= await entityManager
        .createQueryBuilder()
        .select(['id', 'nombre'])
        .from(`${schema}.tipo_servicio`, 'tipo_servicio')
        .where("LOWER(unaccent(tipo_servicio.nombre)) IN (:...nombres)", {
          nombres: normalizedNewTypeServices.map((tc) => tc.nombre.toString()),
        })
        .getRawMany();
        // 🔥 Normalizar nombres existentes para comparación eficiente
        const existingNames = new Set(
            existingTypeServices.map((typeservice) =>
                typeservice.nombre
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            )
        );
        
        // 🔥 Filtrar solo los documentos que no están duplicados
        const uniqueTypeServices = typeServicesArrayFiltred.uniqueTypeServices.filter((tc) => {
            const normalizedName = tc.nombre
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

            if (existingNames.has(normalizedName)) {
            let existingTypeService = existingTypeServices.find(
                (c) => c.nombre.localeCompare(tc.nombre, undefined, { sensitivity: "base" }) === 0
            );

            if (existingTypeService) {
                existingTypeService.id=tc.id;
                existingTypeService.id_tiposervicio=tc.id_tiposervicio;
                existingTypeService.nombre=tc.nombre;
                existingTypeService.cargo_fijo=tc.cargo_fijo;
                existingTypeService.source_failure='DataBase';
                syncronizedTypeServices.push(existingTypeService);
                return false;
            }
            }
            return true;
        });
        if (uniqueTypeServices.length  > 0) {
        // 🔥 Insertar los clientes con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.tipo_servicio`, [
            'id_tiposervicio',
            'nombre',
            'cargo_fijo',              
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueTypeServices.values()).map((typserv) => ({
              id_tiposervicio: typserv.id_tiposervicio,              
              nombre: typserv.nombre,
              cargo_fijo: typserv.cargo_fijo,    
              uploaded_by_authsupa: typserv.uploaded_by_authsupa,                                  
              sync_with: () => `'${JSON.stringify(typserv.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_tiposervicio", "nombre","cargo_fijo"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedTypoServicio.push(
          ...Array.from(uniqueFilteredTypeServices.values()).map((typserv) => ({
            id: typserv.id, 
            id_tiposervicio: typserv.id_tiposervicio,
            nombre:typserv.nombre,
            cargo_fijo:typserv.cargo_fijo,
          }))
        );                 
        }else{                      
          throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
        }

        await queryRunner.commitTransaction();

        return {
          message: "Cargue exitoso, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedTypoServicio, 
          duplicated: duplicateTypeServices,
          existing:syncronizedTypeServices
        };
      } catch (error) {

        await queryRunner.rollbackTransaction();        
        
        return {
          message: `¡El cargue ha terminado! -> ${error.message || 'Error desconocido'}`,       
          status: false,
          inserted: [],
          duplicated: duplicateTypeServices,
          existing:syncronizedTypeServices
        };
      } finally {
        await queryRunner.release();
      }
    }


/** ✅
   * Retorna todas los tipos de servicio que el usuario no tiene sincronizados
   */
  async getAllTypeServices(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    status:boolean,
    type_services:TypeService[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncCities = await entityManager
      .createQueryBuilder()
      .select('tipo_servicio.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.tipo_servicio`, 'tipo_servicio')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(tipo_servicio.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      return {
        message:
          'Conexión exitosa, se han obtenido las siguientes tipos de servicio no sincronizados:',
        status:true,
        type_services: notSyncCities
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();      

      return {
        message: "¡Error en la conexión, retornando desde la base de datos!! -> "+ error.message, 
        status:false,
        type_services: []
      };
    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   *  Actualiza los registros sincronizados en el mobil
   */
  async syncTypeServices(
    schema: string,
    uuid_authsupa: string,
    typeServicesArrayFiltred:  { uniqueTypeServices: TypeServiceDto[]; duplicateTypeServices: TypeServiceDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    syncronized: TypeServiceDto[],
    duplicated: TypeServiceDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const syncronized : TypeServiceDto[] = [];
  
    try {
      const entityManager = queryRunner.manager;      
  
      if(typeServicesArrayFiltred.uniqueTypeServices.length>0){ 
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingTypeServices = await entityManager
        .createQueryBuilder()
        .select("tipo_servicio.*")
        .from(`${schema}.tipo_servicio`, "tipo_servicio")
        .where("LOWER(unaccent(tipo_servicio.nombre)) IN (:...nombres)", {
          nombres: typeServicesArrayFiltred.uniqueTypeServices.map((tc) => tc.nombre.toString()),
      })
      .getRawMany();
  
      for (const typeservice of typeServicesArrayFiltred.uniqueTypeServices) {
        const existingTypeService= existingTypeServices.find(
          (c) => c.nombre.localeCompare(typeservice.nombre, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingTypeService) {
          let syncWithArray = existingTypeService.sync_with 
          ? (typeof existingTypeService.sync_with === "string" 
              ? JSON.parse(existingTypeService.sync_with) 
              : existingTypeService.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: existingTypeService.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.tipo_servicio`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("id_tiposervicio = :id_tiposervicio", { id_tiposervicio: existingTypeService.id_tiposervicio })
              .execute();

              syncronized.push({ ...existingTypeService });
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
        duplicated: typeServicesArrayFiltred.duplicateTypeServices,
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();      

      return {
        message: `¡La Sincronización ha terminado, retornando desde syncStates !! -> ${error.message || 'Error desconocido'}`, 
        status: false,
        syncronized:syncronized,
        duplicated: typeServicesArrayFiltred.duplicateTypeServices,
      };
    } finally {
      await queryRunner.release();
    }
  }


};

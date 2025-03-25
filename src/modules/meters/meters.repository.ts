import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { WaterMeter } from './meters.entity';
import { Brand } from '../brands/brand.entity';
import { WaterMetersDto } from './dto/meters.dto';
import { UUID } from 'crypto';

@Injectable()
export class WaterMeterRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** ✅
   * Guarda todas los medidores no duplicados y se retorna los registros insertados y duplicados
   */
  async submitAllWaterMeter(
    schema: string,
    waterMeterArrayFiltred: { uniqueWaterMeters: WaterMeter[]; duplicateWaterMeters: WaterMetersDto[] }
  ): Promise<{
    message: string;
    status: boolean;
    inserted: { 
      id: number;
      id_medidor: string ;
      numero_referencia: string }[];
    duplicated: WaterMetersDto[];
    existing:WaterMetersDto[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    

    const insertedWaterMeters: { 
      id: number;
      id_medidor:string;
      numero_referencia: string 
    }[] = [];
    const duplicatedWaterMeters=waterMeterArrayFiltred.duplicateWaterMeters;
    //Medidores de agua ya presentes en la base de datos
    const syncronizedWaterMeters: WaterMetersDto[] = [];
    const uniqueFilteredWaterMeter = new Map<string, WaterMeter>();
    try {
      const entityManager = queryRunner.manager;

      // 🔥 Obtener nombres normalizados que ya existen en la base de datos
      const existingWaterMeters = await entityManager
      .createQueryBuilder()
      .select(['id', 'id_medidor'])
      .from(`${schema}.medidores`, 'medidores')
      .where('medidores.id_medidor IN (:...id_medidor)', {
        id_medidor: waterMeterArrayFiltred.uniqueWaterMeters.map((tc) => tc.id_medidor.toString()),
      })
      .getRawMany();

        for (const waterMeter of waterMeterArrayFiltred.uniqueWaterMeters) {

            const referenceKey = waterMeter.id_medidor.toString().trim();

            if (existingWaterMeters.some((wm) => wm.id_medidor === waterMeter.id_medidor)) {
                let duplicatedDBWaterMeter:WaterMetersDto = {
                    id:waterMeter.id,
                    id_medidor:waterMeter.id_medidor,
                    numero_referencia:waterMeter.numero_referencia,
                    tipo:waterMeter.tipo,
                    modelo:waterMeter.modelo,
                    diametro:waterMeter.diametro,
                    descripcion:waterMeter.descripcion,
                    contrato_id:waterMeter.contrato.id_contrato,
                    marca_id:waterMeter.marca!.id_marca,
                    source_failure:'DataBase'
                };
                syncronizedWaterMeters.push({ ...duplicatedDBWaterMeter }); // Guardar duplicado
            }else {
                uniqueFilteredWaterMeter.set(referenceKey, { ...waterMeter });
            }
        }

      if (uniqueFilteredWaterMeter.size  > 0) {
        // 🔥 Insertar solo los clientes que no estaban duplicados
        await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schema}.medidores`, [
          'id_medidor', 'numero_referencia',
          'tipo', 'modelo', 'diametro',
          'descripcion', 'marca_id',
          'contrato_id', 'uploaded_by_authsupa', 'sync_with'
        ])
        .values(
          Array.from(uniqueFilteredWaterMeter.values()).map((wm) => ({
            id_medidor: wm.id_medidor,
            numero_referencia: wm.numero_referencia,
            tipo: wm.tipo,
            modelo: wm.modelo,
            diametro: wm.diametro,
            descripcion: wm.descripcion,
            marca_id: wm.marca!.id_marca,
            contrato_id: wm.contrato.id_contrato,
            uploaded_by_authsupa: wm.uploaded_by_authsupa,
            sync_with: () => `'${JSON.stringify(wm.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
          }))
        ).execute();

        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedWaterMeters.push(
            ...Array.from(uniqueFilteredWaterMeter.values()).map((wm) => ({
            id: wm.id, 
            id_medidor: wm.id_medidor,
            numero_referencia: wm.numero_referencia,
          }))
        );        
        }else {
          throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
        }
      
      await queryRunner.commitTransaction();
      
      return {
        message: "Cargue exitoso, se han obtenido los siguientes resultados:",
        status:true,
        inserted: insertedWaterMeters,
        duplicated: duplicatedWaterMeters,
        existing:syncronizedWaterMeters
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();      

      return {
        message: `¡El cargue ha terminado! -> ${error.message || 'Error desconocido'}`,      
        status:false,
        inserted: [],
        duplicated: duplicatedWaterMeters,
        existing:syncronizedWaterMeters
      };
    } finally {
      await queryRunner.release();
    }
  }


  /** ✅
   * Retorna todos los medidores de agua que el usuario no tiene sincronizados
   */
  async getAllWaterMeters(
    schema: string,
    uuid_authsupa: string
  ): Promise<{
    message: string,
    status:boolean,
    water_meters:WaterMeter[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
        // 🔥 Configurar dinámicamente el esquema de las entidades principales
        entityManager.connection.getMetadata(WaterMeter).tablePath = `${schema}.medidores`;
        entityManager.connection.getMetadata(Brand).tablePath = `${schema}.marcas`;
      
        // 🔍 Obtener medidores no sincronizados con la relación de marca correctamente gestionada por TypeORM
        const waterMeters = await entityManager
          .createQueryBuilder(WaterMeter, 'medidores')
          .leftJoinAndSelect('medidores.marca', 'marca')
          .select([
            'medidores',  
            'marca.id',         
            'marca.id_marca',      
            'marca.nombre'         
          ]) 
          .where(`NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements(medidores.sync_with::jsonb) AS elem
            WHERE elem->>'uuid_authsupa' = :uuid_authsupa
          )`, { uuid_authsupa })
          .getMany(); // 🔥 `getMany()` en lugar de `getRawMany()`, para obtener objetos `WaterMeter` correctamente formateados
      
        return {
          message: 'Conexión exitosa, se han obtenido los siguientes medidores no sincronizados:',
          status:true,
          water_meters: waterMeters
        };
      });
      
    } catch (error) {

      await queryRunner.rollbackTransaction();
      
      return {
        message: `¡Error en la conexión, retornando desde la base de datos!! ->  ${error.message || 'Error desconocido'}`, 
        status:false,
        water_meters: []
      };
    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   *  Actualiza los registros sincronizados en el mobil
   */
  async syncWaterMeter(
    schema: string,
    uuid_authsupa: string,
    waterMeterArrayFiltred: { uniqueWaterMeters: WaterMetersDto[]; duplicateWaterMeters: WaterMetersDto[] }
  ): Promise<{
    message: string;
    status: boolean;
    syncronized: WaterMetersDto[],
    duplicated: WaterMetersDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
        
    const syncronized : WaterMetersDto[] = [];

    try {
      const entityManager = queryRunner.manager;      
  
      if(waterMeterArrayFiltred.uniqueWaterMeters.length>0){      
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingWaterMeters = await entityManager
        .createQueryBuilder()
        .select("medidores.*")
        .from(`${schema}.medidores`, "medidores")
        .where('medidores.id_medidor IN (:...id_medidor)', {
            id_medidor: waterMeterArrayFiltred.uniqueWaterMeters.map((tc) => tc.id_medidor.toString()),
        })
        .getRawMany();
  
      for (const waterMeter of waterMeterArrayFiltred.uniqueWaterMeters) {
        const existingWaterMeter = existingWaterMeters.find(
          (c) => c.id_medidor.localeCompare(waterMeter.id_medidor, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingWaterMeter) {
          let syncWithArray = existingWaterMeter.sync_with 
          ? (typeof existingWaterMeter.sync_with === "string" 
              ? JSON.parse(existingWaterMeter.sync_with) 
              : existingWaterMeter.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: waterMeter.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.medidores`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("id_medidor = :id_medidor", { id_medidor: existingWaterMeter.id_medidor })
              .execute();

              syncronized.push({ ...existingWaterMeter });
          }
        }
      }      
    }

    if(syncronized.length ===0){
      throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
    }

    await queryRunner.commitTransaction();

      return {
        message:  "Sincronización exitosa, se han obtenido los siguientes resultados",
        status: true,
        syncronized:syncronized,
        duplicated: waterMeterArrayFiltred.duplicateWaterMeters,
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();      

      return {
        message: "¡La Sincronización ha terminado! -> "+ error.message,
        status: false,
        syncronized:syncronized,
        duplicated: waterMeterArrayFiltred.duplicateWaterMeters,
      };
    } finally {
      await queryRunner.release();
    }
  }
  
}

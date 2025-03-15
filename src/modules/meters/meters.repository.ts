import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { WaterMeter } from './meters.entity';
import { WaterMetersDto } from './dto/meters.dto';
import { UUID } from 'crypto';

@Injectable()
export class WaterMeterRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** ✅
   * Guarda todas los tipos de clientes no duplicados y se retorna los registros insertados y duplicados
   */
  async submitAllWaterMeter(
    schema: string,
    waterMeterArrayFiltred: { uniqueWaterMeters: WaterMeter[]; duplicateWaterMeters: WaterMetersDto[] }
  ): Promise<{
    message: string;
    status: boolean;
    inserted: { id: number; id_medidor: string ;numero_referencia: bigint }[];
    duplicated: WaterMetersDto[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const insertedWaterMeters: { id: number;id_medidor:string ;numero_referencia: bigint }[] = [];
    const duplicatedWaterMeters=waterMeterArrayFiltred.duplicateWaterMeters;
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
                    source_failure:'Request'
                };
                duplicatedWaterMeters.push({ ...duplicatedDBWaterMeter }); // Guardar duplicado
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
            marca_id: wm.marca ? wm.marca.id_marca : null,
            contrato_id: wm.contrato ? wm.contrato.id_contrato : null,
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
      }
      
      await queryRunner.commitTransaction();
      
      return {
        message: "Sincronización exitosa, se han obtenido los siguientes resultados:",
        status:true,
        inserted: insertedWaterMeters,
        duplicated: duplicatedWaterMeters,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en submitAllTypeClient:', error);
      return {
        message: '¡La Sincronización ha fallado!',
        status:false,
        inserted: [],
        duplicated: [],
      };
    } finally {
      await queryRunner.release();
    }
  }


  /** ✅
   * Retorna todos los tipos de clientes que el usuario no tiene sincronizados
   */
  async getAllWaterMeters(
    schema: string,
    uuid_authsupa: string,

  ): Promise<{
    message: string,
    water_meters:WaterMeter[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncTypeClient = await entityManager
      .createQueryBuilder()
      .select('tipo_cliente.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.medidores`, 'medidores')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(medidores.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      return {
        message:
          'Sincronización exitosa, se han obtenido los siguientes resultados:',
        water_meters: notSyncTypeClient
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en getAllWaterMeters:', error);
      return {
        message: '¡La Sincronización ha fallado, retornando desde la base de datos!',
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
    duplicated: WaterMetersDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const entityManager = queryRunner.manager;
      const uniqueWaterMeter = waterMeterArrayFiltred.uniqueWaterMeters;
  
      if(uniqueWaterMeter.length>0){      
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingWaterMeters = await entityManager
        .createQueryBuilder()
        .select("medidores.*")
        .from(`${schema}.medidores`, "medidores")
        .where('medidores.id_medidor IN (:...id_medidor)', {
            id_medidor: waterMeterArrayFiltred.uniqueWaterMeters.map((tc) => tc.id_medidor.toString()),
        })
        .getRawMany();
  
      for (const waterMeter of uniqueWaterMeter) {
        const existingWaterMeter = existingWaterMeters.find(
          (c) => c.nombre.localeCompare(waterMeter.id_medidor, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingWaterMeters) {
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
          }
        }
      }
  
      await queryRunner.commitTransaction();
    }
      return {
        message: "Sincronización completada",
        status: true,
        duplicated: waterMeterArrayFiltred.duplicateWaterMeters,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Error en syncTypeClient:", error);
      return {
        message: "¡La Sincronización ha fallado, retornando desde la base de datos!",
        status: false,
        duplicated: null,
      };
    } finally {
      await queryRunner.release();
    }
  }
  
}

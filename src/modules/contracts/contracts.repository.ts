import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Contract } from './contract.entity';
import { Client } from '../clients/client.entity';
import { WaterMeter } from '../meters/meters.entity';
import { TypeService } from '../type_services/type_service.entity';
import { SalesRate } from '../sales_rate/sales_rate.entity';
import { MunicipalUnit } from '../municipal_unit/municipal_unit.entity';
import { Activity } from '../activities/activity.entity';
import { TypeClient } from '../type_client/type_client.entity';
import { TypeDocument } from '../type_document/type_document.entity';
import { City } from '../cities/city.entity';
import { State } from '../states/state.entity';
import { Invoice } from '../invoices/invoice.entity';
import { OverdueDebt } from '../overdue_debt/overdue_debt.entity';
import { Brand } from '../brands/brand.entity';
import { ProductsActivity } from '../products_activity/products_activity.entity';
import { PaymentsActivity } from '../payments_activity/payments_activity.entity';


import { ContractsDto, GetDateRangeContractsDto } from './dto/contracts.dto';

@Injectable()
export class ContractRepository {
  constructor(    
    @InjectRepository(Contract) private readonly contratoRepository: Repository<Contract>, // ✅ Inyectamos el repositorio de TypeORM
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}


      /** ✅
       * Guarda todas los contratos no duplicados y se retorna los registros insertados y duplicados
       */
      async submitAllContracts(
        schema: string,
        contractsArrayFiltred: { uniqueContracts: Contract[]; duplicateContracts: ContractsDto[] }
      ): Promise<{
        message: string;
        status: boolean;
        inserted: { id: number; id_contrato: string ;fecha: Date }[];
        duplicated: ContractsDto[];
        existing: ContractsDto[]; 
      }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();          
    
        const insertedContracts: { id: number; id_contrato:string ;fecha: Date }[] = [];
        const duplicatedContracts=contractsArrayFiltred.duplicateContracts;
        //Contratos ya presentes en la base de datos
        const syncronizedContracts: ContractsDto[] = [];
        const uniqueFilteredContracts = new Map<string, Contract>();
        try {
          const entityManager = queryRunner.manager;
    
          // 🔥 Obtener nombres normalizados que ya existen en la base de datos
          const existingContracts = await entityManager
          .createQueryBuilder()
          .select(['id', 'id_contrato'])
          .from(`${schema}.contratos`, 'contratos')
          .where('contratos.id_contrato IN (:...id_contratos)', {
            id_contratos: contractsArrayFiltred.uniqueContracts.map((tc) => tc.id_contrato.toString()),
          })
          .getRawMany();
    
            for (const contract of contractsArrayFiltred.uniqueContracts) {
    
                const referenceKey = contract.id_contrato.toString().trim();
    
                if (existingContracts.some((ctr) => ctr.id_contrato === contract.id_contrato)) {
                    let duplicatedDBContract:ContractsDto = {
                        id:contract.id,
                        id_contrato:contract.id_contrato,
                        fecha:contract.fecha,
                        cliente_id:contract.cliente_id,
                        medidor_id:contract.medidor_id,
                        tiposervicio_id:contract.tiposervicio_id,
                        unidad_municipal_id:contract.unidad_municipal_id,
                        source_failure:'DataBase'
                    };
                    syncronizedContracts.push({ ...duplicatedDBContract }); // Guardar duplicado
                }else {
                  uniqueFilteredContracts.set(referenceKey, { ...contract });
                }
            }
    
          if (uniqueFilteredContracts.size  > 0) {
            // 🔥 Insertar solo los clientes que no estaban duplicados
            await entityManager
            .createQueryBuilder()
            .insert()
            .into(`${schema}.contratos`, [
              'id_contrato', 'fecha',
              'cliente_id', 'medidor_id', 'tiposervicio_id',
              'unidad_municipal_id', 'uploaded_by_authsupa', 'sync_with'
            ])
            .values(
              Array.from(uniqueFilteredContracts.values()).map((ctr) => ({
                id_contrato: ctr.id_contrato,
                fecha: ctr.fecha,
                cliente_id: ctr.cliente!.id_cliente,
                medidor_id: ctr.medidor!.id_medidor,
                tiposervicio_id: ctr.tipo_servicio!.id_tiposervicio,
                unidad_municipal_id: ctr.unidad_municipal!.id_unidadmunicipal,                                
                uploaded_by_authsupa: ctr.uploaded_by_authsupa,
                sync_with: () => `'${JSON.stringify(ctr.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
              }))
            ).execute();
    
            // 🔥 Asociar los nombres insertados con los IDs originales
            insertedContracts.push(
                ...Array.from(uniqueFilteredContracts.values()).map((ctr) => ({
                id: ctr.id, 
                id_contrato: ctr.id_contrato,
                fecha: ctr.fecha,
              }))
            );                
            }else{                      
              throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
            }
          
          await queryRunner.commitTransaction();
          
          return {
            message: "Cargue exitoso, se han obtenido los siguientes resultados:",
            status:true,
            inserted: insertedContracts,
            duplicated: duplicatedContracts,
            existing:syncronizedContracts
          };
        } catch (error) {

          await queryRunner.rollbackTransaction();          

          return {
            message: `¡El cargue ha terminado! -> ${error.message || 'Error desconocido'}`,      
            status:false,
            inserted: [],
            duplicated: duplicatedContracts,
            existing:syncronizedContracts
          };
        } finally {
          await queryRunner.release();
        }
      }
    /** ✅
     * Obtiene todos las contratos junto sus facturas
    */
    async getAllContracts(schema: string,uuid_authsupa: string): Promise<{
      message: string,
      status:boolean,
      contracts:Contract[]
    }> {
      try {
        return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
          // 🔥 Configurar dinámicamente el esquema de las entidades principales
          entityManager.connection.getMetadata(Contract).tablePath = `${schema}.contratos`;
          entityManager.connection.getMetadata(Client).tablePath = `${schema}.clientes`;
          entityManager.connection.getMetadata(TypeClient).tablePath = `${schema}.tipo_cliente`;
          entityManager.connection.getMetadata(TypeDocument).tablePath = `${schema}.tipo_documento`;
          entityManager.connection.getMetadata(WaterMeter).tablePath = `${schema}.medidores`;
          entityManager.connection.getMetadata(Brand).tablePath = `${schema}.marcas`;
          entityManager.connection.getMetadata(TypeService).tablePath = `${schema}.tipo_servicio`;
          entityManager.connection.getMetadata(SalesRate).tablePath = `${schema}.tarifas`;
          entityManager.connection.getMetadata(MunicipalUnit).tablePath = `${schema}.unidad_municipal`;
          entityManager.connection.getMetadata(City).tablePath = `${schema}.ciudades`;
          entityManager.connection.getMetadata(State).tablePath = `${schema}.departamentos`;
          entityManager.connection.getMetadata(Activity).tablePath = `${schema}.actividades`;
          entityManager.connection.getMetadata(ProductsActivity).tablePath = `${schema}.productos_actividad`;
          entityManager.connection.getMetadata(PaymentsActivity).tablePath = `${schema}.pagos_actividades`;
          entityManager.connection.getMetadata(Invoice).tablePath = `${schema}.facturas`;
          entityManager.connection.getMetadata(OverdueDebt).tablePath = `${schema}.moras`;
        
          // 🔍 Obtener contratos no sincronizados con relaciones específicas
          const contracts = await entityManager
            .createQueryBuilder(Contract, 'contratos')
            .leftJoinAndSelect('contratos.cliente', 'cliente')
            .leftJoinAndSelect('cliente.tipo_cliente', 'tipo_cliente')
            .leftJoinAndSelect('cliente.tipo_documento', 'tipo_documento')
            .leftJoinAndSelect('contratos.medidor', 'medidor')
            .leftJoinAndSelect('medidor.marca', 'marca')
            .leftJoinAndSelect('contratos.tipo_servicio', 'tipo_servicio')
            .leftJoinAndSelect('contratos.unidad_municipal', 'unidad_municipal')
            .leftJoinAndSelect('unidad_municipal.ciudad', 'ciudad')
            .leftJoinAndSelect('unidad_municipal.departamento', 'departamento')
            .leftJoinAndSelect('contratos.facturas', 'facturas')
            .leftJoinAndSelect('facturas.usuario', 'usuario') 
            .leftJoinAndSelect('contratos.actividades', 'actividades')
            .leftJoinAndSelect('actividades.productos_actividad', 'productos_actividad')
            .leftJoinAndSelect('actividades.pagos_actividad', 'pagos_actividad')
            .where(`NOT EXISTS (
              SELECT 1 FROM jsonb_array_elements(contratos.sync_with::jsonb) AS elem
              WHERE elem->>'uuid_authsupa' = :uuid_authsupa
            )`, { uuid_authsupa })        
            .getMany(); 
        
          return {
            message: 'Conexión exitosa, se han obtenido los siguientes contratos no sincronizados:',
            status:true,
            contracts
          };
        });          
      }catch (error) {
        return {
          message: `¡Error en la conexión, retornando desde la base de datos!! ->  ${error.message || 'Error desconocido'}`, 
          status:false,
          contracts: []
        };
      }
  }
        /** ✅
         * Obtiene todas las facturas dentro del rango de fechas
         */
    async getDateRangeContracts(schema: string, dateRange:GetDateRangeContractsDto,uuid_authsupa: string):   Promise<{
      message: string,
      status:boolean,
      contracts:Contract[]
    }>{
      try {
    
        const { startDate, endDate } = dateRange; 
        
        return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
          // 🔥 Configurar dinámicamente el esquema de las entidades principales
          entityManager.connection.getMetadata(Contract).tablePath = `${schema}.contratos`;
          entityManager.connection.getMetadata(Client).tablePath = `${schema}.clientes`;
          entityManager.connection.getMetadata(TypeClient).tablePath = `${schema}.tipo_cliente`;
          entityManager.connection.getMetadata(TypeDocument).tablePath = `${schema}.tipo_documento`;
          entityManager.connection.getMetadata(WaterMeter).tablePath = `${schema}.medidores`;
          entityManager.connection.getMetadata(Brand).tablePath = `${schema}.marcas`;
          entityManager.connection.getMetadata(TypeService).tablePath = `${schema}.tipo_servicio`;
          entityManager.connection.getMetadata(SalesRate).tablePath = `${schema}.tarifas`;
          entityManager.connection.getMetadata(MunicipalUnit).tablePath = `${schema}.unidad_municipal`;
          entityManager.connection.getMetadata(City).tablePath = `${schema}.ciudades`;
          entityManager.connection.getMetadata(State).tablePath = `${schema}.departamentos`;
          entityManager.connection.getMetadata(Activity).tablePath = `${schema}.actividades`;
          entityManager.connection.getMetadata(ProductsActivity).tablePath = `${schema}.productos_actividad`;
          entityManager.connection.getMetadata(PaymentsActivity).tablePath = `${schema}.pagos_actividades`;
          entityManager.connection.getMetadata(Invoice).tablePath = `${schema}.facturas`;
          entityManager.connection.getMetadata(OverdueDebt).tablePath = `${schema}.moras`;
        
          // 🔍 Obtener contratos no sincronizados con relaciones específicas
          const contracts = await entityManager
            .createQueryBuilder(Contract, 'contratos')
            .leftJoinAndSelect('contratos.cliente', 'cliente')
            .leftJoinAndSelect('cliente.tipo_cliente', 'tipo_cliente')
            .leftJoinAndSelect('cliente.tipo_documento', 'tipo_documento')
            .leftJoinAndSelect('contratos.medidor', 'medidor')
            .leftJoinAndSelect('medidor.marca', 'marca')
            .leftJoinAndSelect('contratos.tipo_servicio', 'tipo_servicio')
            .leftJoinAndSelect('contratos.unidad_municipal', 'unidad_municipal')
            .leftJoinAndSelect('unidad_municipal.ciudad', 'ciudad')
            .leftJoinAndSelect('unidad_municipal.departamento', 'departamento')
            .leftJoinAndSelect('contratos.facturas', 'facturas')
            .leftJoinAndSelect('facturas.usuario', 'usuario') 
            .leftJoinAndSelect('contratos.actividades', 'actividades')
            .leftJoinAndSelect('actividades.productos_actividad', 'productos_actividad')
            .leftJoinAndSelect('actividades.pagos_actividad', 'pagos_actividad')    
            .where('contratos.fecha BETWEEN :startDate AND :endDate', {
              startDate,
              endDate
            })
            .where(`NOT EXISTS (
              SELECT 1 FROM jsonb_array_elements(contratos.sync_with::jsonb) AS elem
              WHERE elem->>'uuid_authsupa' = :uuid_authsupa
            )`, { uuid_authsupa })   
            .getMany(); 
        
          return {
            message: 'Conexión exitosa, se han obtenido los siguientes contratos no sincronizados:',
            status:true,
            contracts
          };
        });     

      }catch (error) {
        return {
          message: `¡Error en la conexión, retornando desde la base de datos!! ->  ${error.message || 'Error desconocido'}`, 
          status:false,
          contracts: []
        };
    }
  }

  /** ✅
     *  Actualiza los registros sincronizados en el mobil
     */
    async syncContracts(
      schema: string,
      uuid_authsupa: string,
      contractsArrayFiltred: { uniqueContracts: ContractsDto[]; duplicateContracts: ContractsDto[] }
    ): Promise<{
      message: string;
      status: boolean;
      syncronized: ContractsDto[];
      duplicated: ContractsDto[] | null;
    }> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      const syncronized : ContractsDto[] = [];
  
      try {
        const entityManager = queryRunner.manager;      
    
        if(contractsArrayFiltred.uniqueContracts.length>0){      
        // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
        const existingContracts = await entityManager
          .createQueryBuilder()
          .select("contratos.*")
          .from(`${schema}.contratos`, "contratos")
          .where('contratos.id_contrato IN (:...id_contratos)', {
            id_contratos: contractsArrayFiltred.uniqueContracts.map((tc) => tc.id_contrato.toString()),
          })
          .getRawMany();
    
        for (const contract of contractsArrayFiltred.uniqueContracts) {
          const existingContract = existingContracts.find(
            (c) => c.id_contrato.localeCompare(contract.id_contrato, undefined, { sensitivity: "base" }) === 0
          );
    
          if (existingContract) {
            let syncWithArray = existingContract.sync_with 
            ? (typeof existingContract.sync_with === "string" 
                ? JSON.parse(existingContract.sync_with) 
                : existingContract.sync_with) 
            : [];
    
            // 🔥 Verificar si ya existe el uuid en `sync_with`
            const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
    
            if (!alreadyExists) {
              syncWithArray.push({ id: contract.id, uuid_authsupa });
    
              // 🔥 Actualizar `sync_with` correctamente
              await entityManager
                .createQueryBuilder()
                .update(`${schema}.contratos`)
                .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
                .where("id_contrato = :id_contrato", { id_contrato: contract.id_contrato })
                .execute();

              syncronized.push({ ...existingContract });
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
          duplicated: contractsArrayFiltred.duplicateContracts,
        };
      } catch (error) {

        await queryRunner.rollbackTransaction();        

        return {
          message: `¡La Sincronización ha terminado, retornando desde syncStates !! -> ${error.message || 'Error desconocido'}`, 
          status: false,
          syncronized:syncronized,
          duplicated: contractsArrayFiltred.duplicateContracts,
        };
      } finally {
        await queryRunner.release();
      }
    }

};
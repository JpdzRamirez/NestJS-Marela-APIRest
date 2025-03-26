import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { Invoice } from './invoice.entity';

import { InvoiceDto,GetDateRangeInvoicesDto } from './dto/invoice.dto';

@Injectable()
export class InvoiceRepository {
  constructor(    
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>, // ✅ Inyectamos el repositorio de TypeORM
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  
        /** ✅
         * Guarda todas las facturas no duplicados y se retorna las facturas insertados y duplicados
         */
    async submitAllInvoices(
        schema: string,
        invoicesArrayFiltred: { uniqueInvoices: Invoice[]; duplicateInvoices: InvoiceDto[] }
        ): Promise<{
          message: string;
          status: boolean;
          inserted: {
             id: number;
             id_factura: string;
             fecha_lectura: Date 
          }[];
          duplicated: InvoiceDto[];
          existing: InvoiceDto[]; 
        }> {
          const queryRunner = this.dataSource.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();          
      
          const insertedInvoices: {
             id: number;
             id_factura:string;
             fecha_lectura: Date 
          }[] = [];
          const duplicatedInvoices=invoicesArrayFiltred.duplicateInvoices;
          //Contratos ya presentes en la base de datos
          const syncronizedInvoices: InvoiceDto[] = [];
          const uniqueFilteredInvoices = new Map<string, Invoice>();
          try {
            const entityManager = queryRunner.manager;
      
            // 🔥 Obtener nombres normalizados que ya existen en la base de datos
            const existingInvoices = await entityManager
            .createQueryBuilder()
            .select(['id', 'id_factura','fecha_lectura'])
            .from(`${schema}.facturas`, 'facturas')
            .where('facturas.id_factura IN (:...id_facturas)', {
              id_facturas: invoicesArrayFiltred.uniqueInvoices.map((tc) => tc.id_factura.toString()),
            })
            .getRawMany();
      
              for (const invoice of invoicesArrayFiltred.uniqueInvoices) {
      
                  const referenceKey = invoice.id_factura.toString().trim();
      
                  if (existingInvoices.some((ctr) => ctr.id_factura === invoice.id_factura)) {
                      let duplicatedDBInvoice:InvoiceDto = {
                          id:invoice.id,
                          id_factura:invoice.id_factura,
                          qr:invoice.qr ? invoice.qr :null,
                          consumo:invoice.consumo,
                          total:invoice.total,
                          folio:invoice.folio,
                          pagada:invoice.pagada ? invoice.pagada: false,
                          fecha_lectura:invoice.fecha_lectura ,
                          lectura_actual:invoice.lectura_actual,
                          lectura_anterior:invoice.lectura_anterior ? invoice.lectura_anterior: undefined,
                          fecha_pago:invoice.fecha_pago ? invoice.fecha_pago : undefined,                          
                          fecha_pago_oportuno:invoice.fecha_pago_oportuno!,
                          contrato_id:invoice.contrato.id_contrato,
                          user_id:invoice.usuario!.uuid_authsupa!,
                          source_failure:'DataBase'
                      };
                      syncronizedInvoices.push({ ...duplicatedDBInvoice }); // Guardar duplicado
                  }else {
                    uniqueFilteredInvoices.set(referenceKey, { ...invoice });
                  }
              }
      
            if (uniqueFilteredInvoices.size  > 0) {
              // 🔥 Insertar solo los clientes que no estaban duplicados
              await entityManager
              .createQueryBuilder()
              .insert()
              .into(`${schema}.facturas`, [
                'id_factura', 'contrato_id',
                'user_id', 'consumo', 'qr',
                'total','folio','pagada','lectura_actual','lectura_anterior',
                'fecha_lectura','fecha_pago_oportuno','fecha_pago',
                'uploaded_by_authsupa', 'sync_with'
              ])
              .values(
                Array.from(uniqueFilteredInvoices.values()).map((inv) => ({
                  id_factura: inv.id_factura,
                  contrato_id: inv.contrato.id_contrato,
                  user_id: inv.usuario!.uuid_authsupa,
                  consumo: inv.consumo,
                  qr: inv.qr,
                  total: inv.total,
                  folio: inv.folio,
                  pagada: inv.pagada,
                  lectura_actual: inv.lectura_actual,
                  lectura_anterior: inv.lectura_anterior,
                  fecha_lectura: inv.fecha_lectura,
                  fecha_pago_oportuno: inv.fecha_pago_oportuno,
                  fecha_pago: inv.fecha_pago,
                  uploaded_by_authsupa: inv.uploaded_by_authsupa,
                  sync_with: () => `'${JSON.stringify(inv.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
                }))
              ).execute();
      
              // 🔥 Asociar los nombres insertados con los IDs originales
              insertedInvoices.push(
                  ...Array.from(uniqueFilteredInvoices.values()).map((inv) => ({
                  id: inv.id, 
                  id_factura: inv.id_factura,
                  fecha_lectura: inv.fecha_lectura,
                }))
              );                
              }else{                      
                throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
              }
            
            await queryRunner.commitTransaction();
            
            return {
              message: "Cargue exitoso, se han obtenido los siguientes resultados:",
              status:true,
              inserted: insertedInvoices,
              duplicated: duplicatedInvoices,
              existing:syncronizedInvoices
            };
          } catch (error) {
  
            await queryRunner.rollbackTransaction();          
  
            return {
              message: `¡El cargue ha terminado retornando desde submitAllInvoices! -> ${error.message || 'Error desconocido'}`,      
              status:false,
              inserted: [],
              duplicated: duplicatedInvoices,
              existing:syncronizedInvoices
            };
          } finally {
            await queryRunner.release();
          }
    }
    /** ✅
     * Obtiene todas las facturas
     */
    async getAllInvoices(schema: string,uuid_authsupa: string):  Promise<{
          message: string,
          status:boolean,
          invoices:Invoice[]
        }>  {
      try {
        return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
          // 🔥 Configurar dinámicamente el esquema de las entidades principales
          entityManager.connection.getMetadata(Invoice).tablePath = `${schema}.facturas`;
          
            // 🔍 Obtener facturas no sincronizados con relaciones específicas
            const invoices = await entityManager
            .createQueryBuilder(Invoice, 'facturas')
            .leftJoinAndSelect('facturas.contrato', 'contrato')
            .leftJoinAndSelect('facturas.usuario', 'usuario')          
            .where(`NOT EXISTS (
              SELECT 1 FROM jsonb_array_elements(facturas.sync_with::jsonb) AS elem
              WHERE elem->>'uuid_authsupa' = :uuid_authsupa
            )`, { uuid_authsupa }) 
              .getMany(); 
          
            return {
              message: 'Conexión exitosa, se han obtenido los siguientes facturas no sincronizados:',
              status:true,
              invoices
            };
          }); 
          }catch (error) {
            return {
              message: `¡Error en la conexión, retornando desde getAllInvoices!! ->  ${error.message || 'Error desconocido'}`, 
              status:false,
              invoices: []
            };
        }
    }
    /** ✅
     * Obtiene todas las facturas dentro del rango de fechas
     */
    async getDateRangeInvoices(schema: string, dateRange:GetDateRangeInvoicesDto,uuid_authsupa: string): Promise<{
          message: string,
          status:boolean,
          invoices:Invoice[]
        }> {
          try {

            const { startDate, endDate } = dateRange; 

            return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
              // 🔥 Configurar dinámicamente el esquema de las entidades principales
              entityManager.connection.getMetadata(Invoice).tablePath = `${schema}.facturas`;
            
              // 🔍 Obtener contratos no sincronizados con relaciones específicas
              const invoices = await entityManager
              .createQueryBuilder(Invoice, 'facturas')
              .leftJoinAndSelect('facturas.contrato', 'contrato')
              .leftJoinAndSelect('facturas.usuario', 'usuario')
              .where('facturas.fecha_lectura BETWEEN :startDate AND :endDate', { startDate, endDate })
              .andWhere(`NOT EXISTS (
                SELECT 1 FROM jsonb_array_elements(facturas.sync_with::jsonb) AS elem
                WHERE elem->>'uuid_authsupa' = :uuid_authsupa
              )`, { uuid_authsupa }) 
                .getMany(); 
            
              return {
                message: 'Conexión exitosa, se han obtenido los siguientes facturas no sincronizados:',
                status:true,
                invoices
              };
            }); 
          } catch (error) {
            return {
              message: `¡La sincronización ha terminado, retornando desde getDateRangeInvoices!! ->  ${error.message || 'Error desconocido'}`, 
              status:false,
              invoices: []
            };
          }
    }


     /** ✅
         *  Actualiza los registros sincronizados en el mobil
         */
        async syncInvoices(
          schema: string,
          uuid_authsupa: string,
          invoicesArrayFiltred: { uniqueInvoices: InvoiceDto[]; duplicateInvoices: InvoiceDto[] }
        ): Promise<{
          message: string;
          status: boolean;
          syncronized: InvoiceDto[];
          duplicated: InvoiceDto[] | null;
        }> {
          const queryRunner = this.dataSource.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();
          
          const syncronized : InvoiceDto[] = [];
      
          try {
            const entityManager = queryRunner.manager;      
        
            if(invoicesArrayFiltred.uniqueInvoices.length>0){      
            // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
            const existingInvoices = await entityManager
              .createQueryBuilder()
              .select("facturas.*")
              .from(`${schema}.facturas`, "facturas")
              .where('facturas.id_factura IN (:...id_facturas)', {
                id_facturas: invoicesArrayFiltred.uniqueInvoices.map((tc) => tc.id_factura.toString()),
              })
              .getRawMany();
        
            for (const invoice of invoicesArrayFiltred.uniqueInvoices) {
              const existingInvoice = existingInvoices.find(
                (c) => c.id_factura.localeCompare(invoice.id_factura, undefined, { sensitivity: "base" }) === 0
              );
        
              if (existingInvoice) {
                let syncWithArray = existingInvoice.sync_with 
                ? (typeof existingInvoice.sync_with === "string" 
                    ? JSON.parse(existingInvoice.sync_with) 
                    : existingInvoice.sync_with) 
                : [];
        
                // 🔥 Verificar si ya existe el uuid en `sync_with`
                const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
        
                if (!alreadyExists) {
                  syncWithArray.push({ id: invoice.id, uuid_authsupa });
        
                  // 🔥 Actualizar `sync_with` correctamente
                  await entityManager
                    .createQueryBuilder()
                    .update(`${schema}.facturas`)
                    .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
                    .where("id_factura = :id_factura", { id_factura: invoice.id_factura })
                    .execute();
    
                  syncronized.push({ ...existingInvoice });
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
              duplicated: invoicesArrayFiltred.duplicateInvoices,
            };
          } catch (error) {
    
            await queryRunner.rollbackTransaction();        
    
            return {
              message: `¡La Sincronización ha terminado, retornando desde syncInvoices !! -> ${error.message || 'Error desconocido'}`, 
              status: false,
              syncronized:syncronized,
              duplicated: invoicesArrayFiltred.duplicateInvoices,
            };
          } finally {

            await queryRunner.release();
            
          }
        }
};
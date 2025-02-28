import { Injectable } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager} from 'typeorm';
import { Contract } from './contract.entity';
import { Client } from '../clients/client.entity';
import { Meter } from '../meters/meters.entity';
import { TypeService } from '../type_services/type_service.entity';
import { SalesRate } from '../sales_rate/sales_rate.entity';
import { MunicipalUnit } from '../municipal_unit/municipal_unit.entity';
import { Activity } from '../activities/activity.entity';
import { TypeClient } from '../type_client/type_client.entity';
import { TypeDocument } from '../type_document/type_document.entity';
import { City } from '../cities/city.entity';
import { State } from '../states/state.entity';
import { Invoice } from '../invoices/invoice.entity';
import { Brand } from '../brands/brand.entity';
import { ProductsActivity } from '../products_activity/products_activity.entity';
import { PaymentsActivity } from '../payments_activity/payments_activity.entity';


import { GetDateRangeContractsDto } from './dto/get-dateRangeContracts.dto';

@Injectable()
export class ContractRepository {
  constructor(    
    @InjectRepository(Contract) private readonly contratoRepository: Repository<Contract>, // ✅ Inyectamos el repositorio de TypeORM
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Obtiene todos las contratos junto sus facturas
    */
    async getAllContracts(schema: string): Promise<Contract[]> {
      return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
        // 🔥 Cambiar dinámicamente el esquema de las entidades principales
        entityManager.connection.getMetadata(Contract).tablePath = `${schema}.contratos`;

        entityManager.connection.getMetadata(Client).tablePath = `${schema}.clientes`;
        entityManager.connection.getMetadata(TypeClient).tablePath = `${schema}.tipo_cliente`;
        entityManager.connection.getMetadata(TypeDocument).tablePath = `${schema}.tipo_documento`;

        entityManager.connection.getMetadata(Meter).tablePath = `${schema}.medidores`;
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
    
        return await entityManager.find(Contract, {
          relations: [
            'cliente',
            'cliente.tipo_cliente', 
            'cliente.tipo_documento',
            'medidor',
            'medidor.marca',
            'tipo_servicio',
            'tipo_servicio.tarifas',
            'unidad_municipal',
            'unidad_municipal.ciudad',
            'unidad_municipal.departamento',
            'facturas',
            'facturas.usuario',
            'actividades',
            'actividades.productos_actividad',
            'actividades.pagos_actividad'
          ],
        });
      });
    }
        /** ✅
         * Obtiene todas las facturas dentro del rango de fechas
         */
    async getDateRangeContracts(schema: string, dateRange:GetDateRangeContractsDto): Promise<Contract[]> {
      try {
    
        const { startDate, endDate } = dateRange; 
    
        return await this.contratoRepository
          .createQueryBuilder('factura')
          .from(`${schema}.contratos`, 'contratos')
          .innerJoinAndSelect('contratos.contrato', 'contrato')
          .where('contratos.fecha BETWEEN :start AND :end', { start: startDate, end: endDate })
          .getRawMany(); 
      }catch (error) {
        console.error('❌ Error en getAllInvoices:', error);
        throw error;
    }
  }

};
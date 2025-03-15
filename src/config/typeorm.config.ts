import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Activity } from '../modules/activities/activity.entity';
import { User } from '../modules/users/user.entity';
import { Role } from '../modules/roles/role.entity';
import { Schemas } from '../modules/schemas/schema.entity';
import { Invoice } from '../modules/invoices/invoice.entity';
import { Contract } from '../modules/contracts/contract.entity';
import { OverdueDebt } from '../modules/overdue_debt/overdue_debt.entity';
import { InvoiceHeader } from '../modules/invoice_header/invoice_header.entity';
import { InvoiceFooter } from '../modules/invoice_footer/invoice_footer.entity';
import { Client } from '../modules/clients/client.entity';
import { Brand } from '../modules/brands/brand.entity';
import { City } from '../modules/cities/city.entity';
import { WaterMeter } from '../modules/meters/meters.entity';
import { TypeClient } from '../modules/type_client/type_client.entity';
import { TypeDocument } from '../modules/type_document/type_document.entity';
import { TypeService } from '../modules/type_services/type_service.entity';
import { MunicipalUnit } from '../modules/municipal_unit/municipal_unit.entity';
import { PaymentsActivity } from '../modules/payments_activity/payments_activity.entity';
import { ProductsActivity } from '../modules/products_activity/products_activity.entity';
import { SalesRate } from '../modules/sales_rate/sales_rate.entity';
import { State } from '../modules/states/state.entity';
import { Trail } from '../modules/trails/trail.entity';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'), // 🔹 Usa ConfigService para obtener la variable de entorno
  synchronize: false,
  logging: false,
  entities: [
    Activity,User,Role,Schemas,Invoice,Contract,
    Client,InvoiceHeader,InvoiceFooter,WaterMeter,
    Brand,City,TypeClient,TypeDocument,TypeService,
    MunicipalUnit,PaymentsActivity,ProductsActivity,Trail,
    SalesRate,State,OverdueDebt

  ],
  migrations: ['src/migrations/**/*.ts'],
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

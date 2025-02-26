import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/user.entity';
import { Role } from '../modules/roles/role.entity';
import { Schemas } from '../modules/schemas/schema.entity';
import { Invoice } from '../modules/invoices/invoice.entity';
import { Contract } from '../modules/contracts/contract.entity';
import { Client } from '../modules/clients/client.entity';
import { Brand } from '../modules/brands/brand.entity';
import { Meter } from '../modules/meters/meters.entity';
import { TypeClient } from '../modules/type_client/type_client.entity';
import { TypeDocument } from '../modules/type_document/type_document.entity';
import { TypeService } from '../modules/type_services/type_service.entity';
import { MunicipalUnit } from '../modules/municipal_unit/municipal_unit.entity';
import { Trail } from '../modules/trails/trail.entity';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'), // 🔹 Usa ConfigService para obtener la variable de entorno
  synchronize: true,
  logging: false,
  entities: [
    User,Role,Schemas,Invoice,Contract,
    Client,Meter,Brand,TypeClient,
    TypeDocument,TypeService,MunicipalUnit,
    Trail
  ],
  migrations: ['src/migrations/**/*.ts'],
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

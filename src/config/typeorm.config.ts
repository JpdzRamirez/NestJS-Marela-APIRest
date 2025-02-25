import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/user.entity';
import { Role } from '../modules/roles/role.entity';
import { Schemas } from '../modules/schemas/schema.entity';
import { Invoice } from '../modules/invoices/invoice.entity';
import { Contract } from '../modules/contracts/contract.entity';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'), // 🔹 Usa ConfigService para obtener la variable de entorno
  synchronize: true,
  logging: false,
  entities: [User, Role,Schemas,Invoice,Contract],
  migrations: ['src/migrations/**/*.ts'],
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/User.entity';
import { Role } from '../modules/roles/Role.entity';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'), // 🔹 Usa ConfigService para obtener la variable de entorno
  synchronize: true,
  logging: false,
  entities: [User, Role],
  migrations: ['src/migrations/**/*.ts'],
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});

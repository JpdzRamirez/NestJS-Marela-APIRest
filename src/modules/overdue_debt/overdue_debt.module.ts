import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OverdueDebt } from './overdue_debt.entity';
import { OverdueDebtRepository } from './overdue_debt.repository';
import { OverdueDebtService  } from './overdue_debt.service';
import { OverdueDebtController } from './overdue_debt.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([OverdueDebt]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule,
      LoggerModule
    ],  
  providers: [OverdueDebtService,OverdueDebtRepository],
  controllers: [OverdueDebtController],
  exports: [OverdueDebtRepository, OverdueDebtService, TypeOrmModule],
})
export class OverdueDebtModule {}

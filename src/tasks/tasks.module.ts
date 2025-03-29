import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { LoggerModule } from '../modules/logger/logger.module';
import { UtilityModule } from '../shared/utility/utility.module';

@Module({
  imports: [
    UtilityModule,
    LoggerModule
  ], 
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

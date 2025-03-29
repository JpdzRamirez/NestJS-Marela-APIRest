import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {

    private readonly logger = new Logger(TasksService.name);

    @Cron(CronExpression.EVERY_10_SECONDS) // Ejecuta cada 10 segundos
    handleCron() {
      this.logger.log('Ejecutando tarea programada...');
      // Aquí va la lógica del cron
    }

}

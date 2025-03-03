import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';


async function bootstrap() {
  ConfigModule.forRoot();
  const app = await NestFactory.create(AppModule);

  // 🔹 Habilitar CORS (para que la API pueda recibir peticiones de otros dominios)
  app.enableCors();

  // 🔹 Habilitar validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 🔹 Remueve datos no definidos en los DTOs
      forbidNonWhitelisted: true, // 🔹 Rechaza datos no definidos en los DTOs
      transform: true, // 🔹 Convierte automáticamente los tipos de datos según los DTOs
    }),
  );

  // 🔹 Configurar prefijo global para la API (opcional, por ejemplo, `/api`)
  app.setGlobalPrefix('api');

  // 🔹 Iniciar el servidor
  await app.listen(process.env.PORT || 3001,'0.0.0.0');
}
bootstrap();

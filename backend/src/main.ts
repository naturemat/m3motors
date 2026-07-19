import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpLoggerMiddleware } from './shared/infrastructure/logging/http-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // HTTP Request/Response logging (only in debug mode)
  if (process.env.LOG_LEVEL === 'debug') {
    app.use(new HttpLoggerMiddleware().use.bind(new HttpLoggerMiddleware()));
    console.log('[Debug] HTTP request/response logging ACTIVADO');
  }

  // Configurar CORS — permite localhost (cualquier puerto) + producción
  const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
  });

  // Configurar validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Aumentar límite del body parser para fotos OCR (base64)
  app.use(require('express').json({ limit: '50mb' }));

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('M3Motors API')
    .setDescription(
      'API para gestión de talleres mecánicos y mantenimiento predictivo',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y perfil de usuario')
    .addTag('Vehicles', 'Gestión de vehículos')
    .addTag('Interventions', 'Gestión de intervenciones mecánicas')
    .addTag('Alerts', 'Alertas predictivas de mantenimiento')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.APP_PORT ?? 3000);
  console.log(
    `Documentación Swagger disponible en: http://localhost:${process.env.APP_PORT ?? 3000}/api/docs`,
  );
}
void bootstrap();

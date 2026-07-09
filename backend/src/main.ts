import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

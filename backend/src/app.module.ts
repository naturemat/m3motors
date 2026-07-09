import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClerkModule } from './shared/infrastructure/clerk/clerk.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { EventPublisherModule } from './shared/infrastructure/events/EventPublisherModule';
import { AuthController } from './shared/infrastructure/clerk/controllers/auth.controller';
import { VehicleController } from './interfaces/controllers/vehicle.controller';
import { InterventionController } from './interfaces/controllers/intervention.controller';
import { AlertController } from './interfaces/controllers/alert.controller';
import { InMemoryVehiculoRepository } from './registro-seguimiento/infrastructure/persistence/repositories/InMemoryVehiculoRepository';
import { InMemoryClienteRepository } from './registro-seguimiento/infrastructure/persistence/repositories/InMemoryClienteRepository';
import { InMemoryIntervencionRepository } from './registro-seguimiento/infrastructure/persistence/repositories/InMemoryIntervencionRepository';
import { GeminiOCRService } from './registro-seguimiento/infrastructure/external-services/GeminiOCRService';
import { EcuadorVehicleDataProvider } from './registro-seguimiento/infrastructure/external-services/EcuadorVehicleDataProvider';
import { GroqEngineInfoService } from './registro-seguimiento/infrastructure/external-services/GroqEngineInfoService';
import { RegistrarVehiculoDesdeFoto } from './registro-seguimiento/application/use-cases/RegistrarVehiculoDesdeFoto';

@Module({
  imports: [ClerkModule, PrismaModule, EventPublisherModule],
  controllers: [
    AppController,
    AuthController,
    VehicleController,
    InterventionController,
    AlertController,
  ],
  providers: [
    AppService,
    InMemoryVehiculoRepository,
    InMemoryClienteRepository,
    InMemoryIntervencionRepository,
    GeminiOCRService,
    EcuadorVehicleDataProvider,
    GroqEngineInfoService,
    {
      provide: RegistrarVehiculoDesdeFoto,
      useFactory: (
        ocr: GeminiOCRService,
        dataProvider: EcuadorVehicleDataProvider,
        engineInfo: GroqEngineInfoService,
      ) => new RegistrarVehiculoDesdeFoto(ocr, dataProvider, engineInfo),
      inject: [
        GeminiOCRService,
        EcuadorVehicleDataProvider,
        GroqEngineInfoService,
      ],
    },
  ],
  exports: [
    InMemoryVehiculoRepository,
    InMemoryClienteRepository,
    InMemoryIntervencionRepository,
    RegistrarVehiculoDesdeFoto,
  ],
})
export class AppModule {}

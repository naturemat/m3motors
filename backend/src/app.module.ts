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
import { AdminController } from './interfaces/controllers/admin.controller';
import { InMemoryVehiculoRepository } from './registro-seguimiento/infrastructure/persistence/repositories/InMemoryVehiculoRepository';
import { InMemoryClienteRepository } from './registro-seguimiento/infrastructure/persistence/repositories/InMemoryClienteRepository';
import { InMemoryIntervencionRepository } from './registro-seguimiento/infrastructure/persistence/repositories/InMemoryIntervencionRepository';
import { GeminiOCRService } from './registro-seguimiento/infrastructure/external-services/GeminiOCRService';
import { EcuadorVehicleDataProvider } from './registro-seguimiento/infrastructure/external-services/EcuadorVehicleDataProvider';
import { GroqEngineInfoService } from './registro-seguimiento/infrastructure/external-services/GroqEngineInfoService';
import { QRServiceImpl } from './registro-seguimiento/infrastructure/external-services/QRServiceImpl';
import { RegistrarVehiculoDesdeFoto } from './registro-seguimiento/application/use-cases/RegistrarVehiculoDesdeFoto';
import { RegistrarIntervencion } from './registro-seguimiento/application/use-cases/RegistrarIntervencion';
import { RegistrarIngresoVehicular } from './registro-seguimiento/application/use-cases/RegistrarIngresoVehicular';
import { ActivacionClienteService } from './registro-seguimiento/infrastructure/external-services/ActivacionClienteService';
import { ObtenerHistorialVehiculo } from './registro-seguimiento/application/use-cases/ObtenerHistorialVehiculo';
import {
  IVEHICULO_REPOSITORY,
  ICLIENTE_REPOSITORY,
  IINTERVENCION_REPOSITORY,
  IOCR_SERVICE,
  IVEHICLE_DATA_PROVIDER,
  IENGINE_INFO_SERVICE,
  ISERVICIO_GENERACION_QR,
} from './shared/domain/ports/tokens';

@Module({
  imports: [ClerkModule, PrismaModule, EventPublisherModule],
  controllers: [
    AppController,
    AuthController,
    VehicleController,
    InterventionController,
    AlertController,
    AdminController,
  ],
  providers: [
    AppService,
    { provide: IVEHICULO_REPOSITORY, useClass: InMemoryVehiculoRepository },
    { provide: ICLIENTE_REPOSITORY, useClass: InMemoryClienteRepository },
    {
      provide: IINTERVENCION_REPOSITORY,
      useClass: InMemoryIntervencionRepository,
    },
    { provide: IOCR_SERVICE, useClass: GeminiOCRService },
    { provide: IVEHICLE_DATA_PROVIDER, useClass: EcuadorVehicleDataProvider },
    { provide: IENGINE_INFO_SERVICE, useClass: GroqEngineInfoService },
    { provide: ISERVICIO_GENERACION_QR, useClass: QRServiceImpl },
    {
      provide: RegistrarVehiculoDesdeFoto,
      useFactory: (
        ocr: GeminiOCRService,
        dataProvider: EcuadorVehicleDataProvider,
        engineInfo: GroqEngineInfoService,
      ) => new RegistrarVehiculoDesdeFoto(ocr, dataProvider, engineInfo),
      inject: [IOCR_SERVICE, IVEHICLE_DATA_PROVIDER, IENGINE_INFO_SERVICE],
    },
    RegistrarIntervencion,
    RegistrarIngresoVehicular,
    ActivacionClienteService,
    ObtenerHistorialVehiculo,
  ],
  exports: [
    IVEHICULO_REPOSITORY,
    ICLIENTE_REPOSITORY,
    IINTERVENCION_REPOSITORY,
    RegistrarVehiculoDesdeFoto,
    RegistrarIntervencion,
    RegistrarIngresoVehicular,
    ActivacionClienteService,
  ],
})
export class AppModule {}

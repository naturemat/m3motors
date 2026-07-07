import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InMemoryVehiculoRepository } from './registro-seguimiento/infrastructure/persistence/repositories/InMemoryVehiculoRepository';
import { InMemoryClienteRepository } from './registro-seguimiento/infrastructure/persistence/repositories/InMemoryClienteRepository';
import { InMemoryIntervencionRepository } from './registro-seguimiento/infrastructure/persistence/repositories/InMemoryIntervencionRepository';
import { GeminiOCRService } from './registro-seguimiento/infrastructure/external-services/GeminiOCRService';
import { EcuadorVehicleDataProvider } from './registro-seguimiento/infrastructure/external-services/EcuadorVehicleDataProvider';
import { GroqEngineInfoService } from './registro-seguimiento/infrastructure/external-services/GroqEngineInfoService';
import { RegistrarVehiculoDesdeFoto } from './registro-seguimiento/application/use-cases/RegistrarVehiculoDesdeFoto';

@Module({
  imports: [],
  controllers: [AppController],
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
      useFactory: (ocr, dataProvider, engineInfo) =>
        new RegistrarVehiculoDesdeFoto(ocr, dataProvider, engineInfo),
      inject: [GeminiOCRService, EcuadorVehicleDataProvider, GroqEngineInfoService],
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

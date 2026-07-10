import { Module } from '@nestjs/common';
import { PrismaClienteRepository } from './infrastructure/persistence/repositories/PrismaClienteRepository';
import { PrismaVehiculoRepository } from './infrastructure/persistence/repositories/PrismaVehiculoRepository';
import { PrismaIntervencionRepository } from './infrastructure/persistence/repositories/PrismaIntervencionRepository';
import {
  ICLIENTE_REPOSITORY,
  IVEHICULO_REPOSITORY,
  IINTERVENCION_REPOSITORY,
} from '../shared/domain/ports/tokens';

@Module({
  providers: [
    {
      provide: ICLIENTE_REPOSITORY,
      useClass: PrismaClienteRepository,
    },
    {
      provide: IVEHICULO_REPOSITORY,
      useClass: PrismaVehiculoRepository,
    },
    {
      provide: IINTERVENCION_REPOSITORY,
      useClass: PrismaIntervencionRepository,
    },
  ],
  exports: [
    ICLIENTE_REPOSITORY,
    IVEHICULO_REPOSITORY,
    IINTERVENCION_REPOSITORY,
  ],
})
export class RegistroSeguimientoModule {}

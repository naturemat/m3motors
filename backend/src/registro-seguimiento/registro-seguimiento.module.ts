import { Module } from '@nestjs/common';
import { InMemoryClienteRepository } from './infrastructure/persistence/repositories/InMemoryClienteRepository';
import { InMemoryVehiculoRepository } from './infrastructure/persistence/repositories/InMemoryVehiculoRepository';
import { InMemoryIntervencionRepository } from './infrastructure/persistence/repositories/InMemoryIntervencionRepository';
import {
  ICLIENTE_REPOSITORY,
  IVEHICULO_REPOSITORY,
  IINTERVENCION_REPOSITORY,
} from '../shared/domain/ports/tokens';

@Module({
  providers: [
    {
      provide: ICLIENTE_REPOSITORY,
      useClass: InMemoryClienteRepository,
    },
    {
      provide: IVEHICULO_REPOSITORY,
      useClass: InMemoryVehiculoRepository,
    },
    {
      provide: IINTERVENCION_REPOSITORY,
      useClass: InMemoryIntervencionRepository,
    },
  ],
  exports: [
    ICLIENTE_REPOSITORY,
    IVEHICULO_REPOSITORY,
    IINTERVENCION_REPOSITORY,
  ],
})
export class RegistroSeguimientoModule {}

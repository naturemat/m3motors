import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InMemoryVehiculoRepository } from './infrastructure/persistence/repositories/InMemoryVehiculoRepository';
import { InMemoryClienteRepository } from './infrastructure/persistence/repositories/InMemoryClienteRepository';
import { InMemoryIntervencionRepository } from './infrastructure/persistence/repositories/InMemoryIntervencionRepository';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    InMemoryVehiculoRepository,
    InMemoryClienteRepository,
    InMemoryIntervencionRepository,
  ],
  exports: [
    InMemoryVehiculoRepository,
    InMemoryClienteRepository,
    InMemoryIntervencionRepository,
  ],
})
export class AppModule {}

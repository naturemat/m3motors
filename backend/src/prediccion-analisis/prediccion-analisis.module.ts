import { Module } from '@nestjs/common';
import { GenerarPrediccion } from './application/use-cases/GenerarPrediccion';

@Module({
  providers: [GenerarPrediccion],
  exports: [GenerarPrediccion],
})
export class PrediccionAnalisisModule {}

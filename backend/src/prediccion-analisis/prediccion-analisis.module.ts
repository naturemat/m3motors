import { Module } from '@nestjs/common';
import { GenerarPrediccion } from './application/use-cases/GenerarPrediccion';
import { CalculoDesgasteService } from './infrastructure/CalculoDesgasteService';
import { IntervencionRegistradaHandler } from './infrastructure/handlers/IntervencionRegistradaHandler';

@Module({
  providers: [
    GenerarPrediccion,
    CalculoDesgasteService,
    IntervencionRegistradaHandler,
  ],
  exports: [GenerarPrediccion, CalculoDesgasteService],
})
export class PrediccionAnalisisModule {}

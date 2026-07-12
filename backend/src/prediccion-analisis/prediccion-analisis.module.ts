import { Module } from '@nestjs/common';
import { GenerarPrediccion } from './application/use-cases/GenerarPrediccion';
import { CalculoDesgasteService } from './infrastructure/CalculoDesgasteService';
import { IntervencionRegistradaHandler } from './infrastructure/handlers/IntervencionRegistradaHandler';
import { PrediccionLLMService } from './infrastructure/PrediccionLLMService';

@Module({
  providers: [
    GenerarPrediccion,
    CalculoDesgasteService,
    IntervencionRegistradaHandler,
    {
      provide: 'SERVICIO_PREDICCION_LLM',
      useClass: PrediccionLLMService,
    },
  ],
  exports: [GenerarPrediccion, CalculoDesgasteService],
})
export class PrediccionAnalisisModule {}

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GenerarPrediccion } from './application/use-cases/GenerarPrediccion';
import { CalculoDesgasteService } from './infrastructure/CalculoDesgasteService';
import { IntervencionRegistradaHandler } from './infrastructure/handlers/IntervencionRegistradaHandler';
import { EvaluacionDiariaHandler } from './infrastructure/handlers/EvaluacionDiariaHandler';
import { PrediccionLLMService } from './infrastructure/PrediccionLLMService';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    GenerarPrediccion,
    CalculoDesgasteService,
    IntervencionRegistradaHandler,
    EvaluacionDiariaHandler,
    {
      provide: 'SERVICIO_PREDICCION_LLM',
      useClass: PrediccionLLMService,
    },
  ],
  exports: [GenerarPrediccion, CalculoDesgasteService],
})
export class PrediccionAnalisisModule {}

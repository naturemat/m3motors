import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IDomainEventPublisher,
  IDOMAIN_EVENT_PUBLISHER,
} from '../../../shared/domain/ports/events/IDomainEventPublisher';
import { AlertaGeneradaEvent } from '../../domain/events/AlertaGeneradaEvent';
import {
  ServicioPrediccionLLM,
  ContextoVehiculo,
} from '../../domain/domain-services/ServicioPrediccionLLM';

export interface ComponenteCritico {
  nombre: string;
  kilometrajeInstalacion: number;
  limiteKilometraje: number;
}

export interface GenerarPrediccionParams {
  vehicleId: string;
  placa: string;
  clienteId: string;
  marca: string;
  modelo: string;
  anio: number;
  kilometrajeActual: number;
  kmPorSemana: number;
  componentesCriticos: ComponenteCritico[];
}

@Injectable()
export class GenerarPrediccion {
  private readonly logger = new Logger(GenerarPrediccion.name);

  constructor(
    @Inject(IDOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: IDomainEventPublisher,
    @Inject('SERVICIO_PREDICCION_LLM')
    private readonly servicioPrediccion: ServicioPrediccionLLM,
  ) {}

  async execute(params: GenerarPrediccionParams): Promise<void> {
    if (params.componentesCriticos.length === 0) {
      this.logger.log(`Vehículo ${params.vehicleId}: sin componentes críticos`);
      return;
    }

    const contexto: ContextoVehiculo = {
      vehicleId: params.vehicleId,
      placa: params.placa,
      marca: params.marca,
      modelo: params.modelo,
      anio: params.anio,
      kilometrajeActual: params.kilometrajeActual,
      kmPorSemana: params.kmPorSemana,
      componentesCriticos: params.componentesCriticos,
    };

    try {
      const prediccion = await this.servicioPrediccion.predecir(contexto);

      if (prediccion.severidad === 'BAJA' && prediccion.semanasEstimadas > 12) {
        this.logger.log(
          `Vehículo ${params.vehicleId}: ${prediccion.componenteAfectado} OK (${prediccion.semanasEstimadas} semanas)`,
        );
        return;
      }

      const evento = new AlertaGeneradaEvent({
        vehicleId: params.vehicleId,
        placa: params.placa,
        clienteId: params.clienteId,
        componenteAfectado: prediccion.componenteAfectado,
        kilometrajeActual: prediccion.kilometrajeActual,
        kilometrajeLimite: prediccion.kilometrajeLimite,
        semanasEstimadasRestantes: prediccion.semanasEstimadas,
        mesesEstimadosRestantes: prediccion.mesesEstimados,
        mensajePrediccion: prediccion.mensajePrediccion,
        nivelSeveridad: prediccion.severidad,
        recomendacion: prediccion.recomendacion,
      });

      await this.eventPublisher.publish(
        AlertaGeneradaEvent.EVENT_NAME,
        evento.toPayload(),
      );

      this.logger.log(
        `Alerta generada: ${prediccion.componenteAfectado} — ${prediccion.severidad} (${prediccion.semanasEstimadas} sem)`,
      );
    } catch (error) {
      this.logger.error(`Error generando predicción: ${error}`);
    }
  }
}

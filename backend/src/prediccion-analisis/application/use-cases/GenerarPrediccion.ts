import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IDomainEventPublisher,
  IDOMAIN_EVENT_PUBLISHER,
} from '../../../shared/domain/ports/events/IDomainEventPublisher';
import { AlertaGeneradaEvent } from '../../domain/events/AlertaGeneradaEvent';

export interface ComponenteCritico {
  nombre: string;
  kilometrajeInstalacion: number;
  limiteKilometraje: number;
}

export interface GenerarPrediccionParams {
  vehicleId: string;
  placa: string;
  clienteId: string;
  kilometrajeActual: number;
  componentesCriticos: ComponenteCritico[];
}

@Injectable()
export class GenerarPrediccion {
  private readonly logger = new Logger(GenerarPrediccion.name);

  constructor(
    @Inject(IDOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: IDomainEventPublisher,
  ) {}

  async execute(params: GenerarPrediccionParams): Promise<void> {
    for (const componente of params.componentesCriticos) {
      const kilometrajeRestante =
        componente.limiteKilometraje - params.kilometrajeActual;
      const porcentajeDesgaste =
        (params.kilometrajeActual / componente.limiteKilometraje) * 100;

      if (kilometrajeRestante <= 0) {
        const evento = new AlertaGeneradaEvent({
          vehicleId: params.vehicleId,
          placa: params.placa,
          clienteId: params.clienteId,
          componenteAfectado: componente.nombre,
          kilometrajeActual: params.kilometrajeActual,
          kilometrajeLimite: componente.limiteKilometraje,
          semanasEstimadasRestantes: 0,
          mesesEstimadosRestantes: 0,
          mensajePrediccion: `El componente ${componente.nombre} ha superado su limite de kilometraje.`,
          nivelSeveridad: 'CRITICA',
          recomendacion: 'Requiere reemplazo inmediato. Contacte al taller.',
        });

        await this.eventPublisher.publish(
          AlertaGeneradaEvent.EVENT_NAME,
          evento.toPayload(),
        );
      } else if (porcentajeDesgaste >= 80) {
        const kilometrosPorSemana = 200;
        const semanasRestantes = Math.floor(
          kilometrajeRestante / kilometrosPorSemana,
        );
        const mesesRestantes = Math.floor(semanasRestantes / 4);

        let severidad: 'BAJA' | 'MEDIA' | 'CRITICA' = 'BAJA';
        if (porcentajeDesgaste >= 95) {
          severidad = 'CRITICA';
        } else if (porcentajeDesgaste >= 85) {
          severidad = 'MEDIA';
        }

        const evento = new AlertaGeneradaEvent({
          vehicleId: params.vehicleId,
          placa: params.placa,
          clienteId: params.clienteId,
          componenteAfectado: componente.nombre,
          kilometrajeActual: params.kilometrajeActual,
          kilometrajeLimite: componente.limiteKilometraje,
          semanasEstimadasRestantes: semanasRestantes,
          mesesEstimadosRestantes: mesesRestantes,
          mensajePrediccion: `El componente ${componente.nombre} esta al ${porcentajeDesgaste.toFixed(1)}% de desgaste.`,
          nivelSeveridad: severidad,
          recomendacion: `Programar mantenimiento en las proximas ${semanasRestantes} semanas.`,
        });

        await this.eventPublisher.publish(
          AlertaGeneradaEvent.EVENT_NAME,
          evento.toPayload(),
        );
      }
    }
  }
}

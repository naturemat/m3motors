import { DomainEventBase } from '../../../shared/domain/events/DomainEventBase';

export type SeveridadPrediccion = 'BAJA' | 'MEDIA' | 'CRITICA';

export interface AlertaGeneradaPayload extends DomainEventBase {
  readonly eventName: 'alerta.generada';
  readonly vehicleId: string;
  readonly placa: string;
  readonly clienteId: string;
  readonly componenteAfectado: string;
  readonly kilometrajeActual: number;
  readonly kilometrajeLimite: number;
  readonly semanasEstimadasRestantes: number;
  readonly mesesEstimadosRestantes: number;
  readonly mensajePrediccion: string;
  readonly nivelSeveridad: SeveridadPrediccion;
  readonly recomendacion: string;
}

export class AlertaGeneradaEvent {
  static readonly EVENT_NAME = 'alerta.generada' as const;

  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly vehicleId: string;
  public readonly placa: string;
  public readonly clienteId: string;
  public readonly componenteAfectado: string;
  public readonly kilometrajeActual: number;
  public readonly kilometrajeLimite: number;
  public readonly semanasEstimadasRestantes: number;
  public readonly mesesEstimadosRestantes: number;
  public readonly mensajePrediccion: string;
  public readonly nivelSeveridad: SeveridadPrediccion;
  public readonly recomendacion: string;

  constructor(params: {
    vehicleId: string;
    placa: string;
    clienteId: string;
    componenteAfectado: string;
    kilometrajeActual: number;
    kilometrajeLimite: number;
    semanasEstimadasRestantes: number;
    mesesEstimadosRestantes: number;
    mensajePrediccion: string;
    nivelSeveridad: SeveridadPrediccion;
    recomendacion: string;
  }) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.vehicleId = params.vehicleId;
    this.placa = params.placa;
    this.clienteId = params.clienteId;
    this.componenteAfectado = params.componenteAfectado;
    this.kilometrajeActual = params.kilometrajeActual;
    this.kilometrajeLimite = params.kilometrajeLimite;
    this.semanasEstimadasRestantes = params.semanasEstimadasRestantes;
    this.mesesEstimadosRestantes = params.mesesEstimadosRestantes;
    this.mensajePrediccion = params.mensajePrediccion;
    this.nivelSeveridad = params.nivelSeveridad;
    this.recomendacion = params.recomendacion;
    Object.freeze(this);
  }

  toPayload(): AlertaGeneradaPayload {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: AlertaGeneradaEvent.EVENT_NAME,
      vehicleId: this.vehicleId,
      placa: this.placa,
      clienteId: this.clienteId,
      componenteAfectado: this.componenteAfectado,
      kilometrajeActual: this.kilometrajeActual,
      kilometrajeLimite: this.kilometrajeLimite,
      semanasEstimadasRestantes: this.semanasEstimadasRestantes,
      mesesEstimadosRestantes: this.mesesEstimadosRestantes,
      mensajePrediccion: this.mensajePrediccion,
      nivelSeveridad: this.nivelSeveridad,
      recomendacion: this.recomendacion,
    };
  }
}

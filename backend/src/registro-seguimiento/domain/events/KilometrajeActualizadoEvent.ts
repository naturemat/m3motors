import { DomainEventBase } from '../../../shared/domain/events/DomainEventBase';

export type OrigenCaptura =
  'INGRESO_TALLER' | 'INSPECCION_RAPIDA' | 'CLIENTE_APP' | 'FOTO_TABLERO';

export interface KilometrajeActualizadoPayload extends DomainEventBase {
  readonly eventName: 'kilometraje.actualizado';
  readonly vehicleId: string;
  readonly placa: string;
  readonly nuevoKilometraje: number;
  readonly kilometrajeAnterior: number;
  readonly origenCaptura: OrigenCaptura;
  readonly fotoTableroUrl: string | null;
}

export class KilometrajeActualizadoEvent {
  static readonly EVENT_NAME = 'kilometraje.actualizado' as const;

  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly vehicleId: string;
  public readonly placa: string;
  public readonly nuevoKilometraje: number;
  public readonly kilometrajeAnterior: number;
  public readonly origenCaptura: OrigenCaptura;
  public readonly fotoTableroUrl: string | null;

  constructor(params: {
    vehicleId: string;
    placa: string;
    nuevoKilometraje: number;
    kilometrajeAnterior: number;
    origenCaptura: OrigenCaptura;
    fotoTableroUrl?: string;
  }) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.vehicleId = params.vehicleId;
    this.placa = params.placa;
    this.nuevoKilometraje = params.nuevoKilometraje;
    this.kilometrajeAnterior = params.kilometrajeAnterior;
    this.origenCaptura = params.origenCaptura;
    this.fotoTableroUrl = params.fotoTableroUrl ?? null;
    Object.freeze(this);
  }

  toPayload(): KilometrajeActualizadoPayload {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: KilometrajeActualizadoEvent.EVENT_NAME,
      vehicleId: this.vehicleId,
      placa: this.placa,
      nuevoKilometraje: this.nuevoKilometraje,
      kilometrajeAnterior: this.kilometrajeAnterior,
      origenCaptura: this.origenCaptura,
      fotoTableroUrl: this.fotoTableroUrl,
    };
  }
}

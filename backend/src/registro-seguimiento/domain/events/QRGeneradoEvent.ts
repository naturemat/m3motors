import { DomainEventBase } from '../../../shared/domain/events/DomainEventBase';

export interface QRGeneradoPayload extends DomainEventBase {
  readonly eventName: 'qr.generado';
  readonly vehicleId: string;
  readonly qrCode: string;
  readonly qrUrl: string;
  readonly fechaGeneracion: Date;
}

export class QRGeneradoEvent {
  static readonly EVENT_NAME = 'qr.generado' as const;

  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly vehicleId: string;
  public readonly qrCode: string;
  public readonly qrUrl: string;
  public readonly fechaGeneracion: Date;

  constructor(params: {
    vehicleId: string;
    qrCode: string;
    qrUrl: string;
  }) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.vehicleId = params.vehicleId;
    this.qrCode = params.qrCode;
    this.qrUrl = params.qrUrl;
    this.fechaGeneracion = new Date();
    Object.freeze(this);
  }

  toPayload(): QRGeneradoPayload {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: QRGeneradoEvent.EVENT_NAME,
      vehicleId: this.vehicleId,
      qrCode: this.qrCode,
      qrUrl: this.qrUrl,
      fechaGeneracion: this.fechaGeneracion,
    };
  }
}

import { DomainEventBase } from '../../../shared/domain/events/DomainEventBase';

export interface WorkshopRegistradoPayload extends DomainEventBase {
  readonly eventName: 'workshop.registrado';
  readonly workshopId: string;
  readonly nombre: string;
  readonly ownerId: string;
  readonly direccion: string;
  readonly telefono: string;
  readonly email: string;
}

export class WorkshopRegistradoEvent {
  static readonly EVENT_NAME = 'workshop.registrado' as const;

  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly workshopId: string;
  public readonly nombre: string;
  public readonly ownerId: string;
  public readonly direccion: string;
  public readonly telefono: string;
  public readonly email: string;

  constructor(params: {
    workshopId: string;
    nombre: string;
    ownerId: string;
    direccion: string;
    telefono: string;
    email: string;
  }) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.workshopId = params.workshopId;
    this.nombre = params.nombre;
    this.ownerId = params.ownerId;
    this.direccion = params.direccion;
    this.telefono = params.telefono;
    this.email = params.email;
    Object.freeze(this);
  }

  toPayload(): WorkshopRegistradoPayload {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: WorkshopRegistradoEvent.EVENT_NAME,
      workshopId: this.workshopId,
      nombre: this.nombre,
      ownerId: this.ownerId,
      direccion: this.direccion,
      telefono: this.telefono,
      email: this.email,
    };
  }
}

import { DomainEventBase } from '../../../shared/domain/events/DomainEventBase';

export interface ClienteActivadoPayload extends DomainEventBase {
  readonly eventName: 'cliente.activado';
  readonly clienteId: string;
  readonly preRegisteredCustomerId: string;
  readonly workshopId: string;
  readonly mechanicId: string;
  readonly nombre: string;
  readonly telefono: string;
  readonly email: string;
  readonly fechaActivacion: Date;
}

export class ClienteActivadoEvent {
  static readonly EVENT_NAME = 'cliente.activado' as const;

  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly clienteId: string;
  public readonly preRegisteredCustomerId: string;
  public readonly workshopId: string;
  public readonly mechanicId: string;
  public readonly nombre: string;
  public readonly telefono: string;
  public readonly email: string;
  public readonly fechaActivacion: Date;

  constructor(params: {
    clienteId: string;
    preRegisteredCustomerId: string;
    workshopId: string;
    mechanicId: string;
    nombre: string;
    telefono: string;
    email: string;
  }) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.clienteId = params.clienteId;
    this.preRegisteredCustomerId = params.preRegisteredCustomerId;
    this.workshopId = params.workshopId;
    this.mechanicId = params.mechanicId;
    this.nombre = params.nombre;
    this.telefono = params.telefono;
    this.email = params.email;
    this.fechaActivacion = new Date();
    Object.freeze(this);
  }

  toPayload(): ClienteActivadoPayload {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: ClienteActivadoEvent.EVENT_NAME,
      clienteId: this.clienteId,
      preRegisteredCustomerId: this.preRegisteredCustomerId,
      workshopId: this.workshopId,
      mechanicId: this.mechanicId,
      nombre: this.nombre,
      telefono: this.telefono,
      email: this.email,
      fechaActivacion: this.fechaActivacion,
    };
  }
}

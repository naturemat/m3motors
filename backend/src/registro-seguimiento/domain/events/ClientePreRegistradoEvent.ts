import { DomainEventBase } from '../../../shared/domain/events/DomainEventBase';

export interface ClientePreRegistradoPayload extends DomainEventBase {
  readonly eventName: 'cliente.pre-registrado';
  readonly preRegisteredCustomerId: string;
  readonly workshopId: string;
  readonly nombre: string;
  readonly telefono: string;
  readonly email: string;
  readonly licensePlate: string | null;
  readonly status: 'PENDING';
}

export class ClientePreRegistradoEvent {
  static readonly EVENT_NAME = 'cliente.pre-registrado' as const;

  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly preRegisteredCustomerId: string;
  public readonly workshopId: string;
  public readonly nombre: string;
  public readonly telefono: string;
  public readonly email: string;
  public readonly licensePlate: string | null;
  public readonly status: 'PENDING';

  constructor(params: {
    preRegisteredCustomerId: string;
    workshopId: string;
    nombre: string;
    telefono: string;
    email: string;
    licensePlate?: string;
  }) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.preRegisteredCustomerId = params.preRegisteredCustomerId;
    this.workshopId = params.workshopId;
    this.nombre = params.nombre;
    this.telefono = params.telefono;
    this.email = params.email;
    this.licensePlate = params.licensePlate ?? null;
    this.status = 'PENDING';
    Object.freeze(this);
  }

  toPayload(): ClientePreRegistradoPayload {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: ClientePreRegistradoEvent.EVENT_NAME,
      preRegisteredCustomerId: this.preRegisteredCustomerId,
      workshopId: this.workshopId,
      nombre: this.nombre,
      telefono: this.telefono,
      email: this.email,
      licensePlate: this.licensePlate,
      status: this.status,
    };
  }
}

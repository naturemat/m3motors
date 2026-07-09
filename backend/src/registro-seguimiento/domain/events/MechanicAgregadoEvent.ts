import { DomainEventBase } from '../../../shared/domain/events/DomainEventBase';

export interface MechanicAgregadoPayload extends DomainEventBase {
  readonly eventName: 'mechanic.agregado';
  readonly mechanicId: string;
  readonly workshopId: string;
  readonly nombre: string;
  readonly especialidad: string;
  readonly usuarioId: string;
  readonly creadoPor: string;
}

export class MechanicAgregadoEvent {
  static readonly EVENT_NAME = 'mechanic.agregado' as const;

  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly mechanicId: string;
  public readonly workshopId: string;
  public readonly nombre: string;
  public readonly especialidad: string;
  public readonly usuarioId: string;
  public readonly creadoPor: string;

  constructor(params: {
    mechanicId: string;
    workshopId: string;
    nombre: string;
    especialidad: string;
    usuarioId: string;
    creadoPor: string;
  }) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.mechanicId = params.mechanicId;
    this.workshopId = params.workshopId;
    this.nombre = params.nombre;
    this.especialidad = params.especialidad;
    this.usuarioId = params.usuarioId;
    this.creadoPor = params.creadoPor;
    Object.freeze(this);
  }

  toPayload(): MechanicAgregadoPayload {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: MechanicAgregadoEvent.EVENT_NAME,
      mechanicId: this.mechanicId,
      workshopId: this.workshopId,
      nombre: this.nombre,
      especialidad: this.especialidad,
      usuarioId: this.usuarioId,
      creadoPor: this.creadoPor,
    };
  }
}

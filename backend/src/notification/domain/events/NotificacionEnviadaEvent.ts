import { DomainEventBase } from '../../../shared/domain/events/DomainEventBase';

export type TipoNotificacion =
  'ALERTA_MANTENIMIENTO' | 'RECOMENDACION' | 'BIENVENIDA' | 'RECORDATORIO';

export type CanalEnvio = 'PUSH' | 'EMAIL';

export interface NotificacionEnviadaPayload extends DomainEventBase {
  readonly eventName: 'notificacion.enviada';
  readonly clienteId: string;
  readonly vehicleId: string | null;
  readonly tipoNotificacion: TipoNotificacion;
  readonly canal: CanalEnvio;
  readonly mensaje: string;
  readonly fechaEnvio: Date;
  readonly entregado: boolean;
  readonly falloMotivo: string | null;
}

export class NotificacionEnviadaEvent {
  static readonly EVENT_NAME = 'notificacion.enviada' as const;

  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly clienteId: string;
  public readonly vehicleId: string | null;
  public readonly tipoNotificacion: TipoNotificacion;
  public readonly canal: CanalEnvio;
  public readonly mensaje: string;
  public readonly fechaEnvio: Date;
  public readonly entregado: boolean;
  public readonly falloMotivo: string | null;

  constructor(params: {
    clienteId: string;
    vehicleId?: string;
    tipoNotificacion: TipoNotificacion;
    canal: CanalEnvio;
    mensaje: string;
    entregado: boolean;
    falloMotivo?: string;
  }) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.clienteId = params.clienteId;
    this.vehicleId = params.vehicleId ?? null;
    this.tipoNotificacion = params.tipoNotificacion;
    this.canal = params.canal;
    this.mensaje = params.mensaje;
    this.fechaEnvio = new Date();
    this.entregado = params.entregado;
    this.falloMotivo = params.falloMotivo ?? null;
    Object.freeze(this);
  }

  toPayload(): NotificacionEnviadaPayload {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: NotificacionEnviadaEvent.EVENT_NAME,
      clienteId: this.clienteId,
      vehicleId: this.vehicleId,
      tipoNotificacion: this.tipoNotificacion,
      canal: this.canal,
      mensaje: this.mensaje,
      fechaEnvio: this.fechaEnvio,
      entregado: this.entregado,
      falloMotivo: this.falloMotivo,
    };
  }
}

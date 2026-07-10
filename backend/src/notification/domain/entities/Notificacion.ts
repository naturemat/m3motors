import { CanalEnvio } from '../value-objects/CanalEnvio';
import { EstadoNotificacion } from '../value-objects/EstadoNotificacion';
import { TipoNotificacion } from '../value-objects/TipoNotificacion';

export interface NotificacionProps {
  id?: string;
  clienteId: string;
  vehicleId?: string;
  tipo: TipoNotificacion;
  canal: CanalEnvio;
  asunto: string;
  contenido: string;
  emailDestino?: string;
  estado?: EstadoNotificacion;
  entregado?: boolean;
  falloMotivo?: string;
  intentos?: number;
  maxIntentos?: number;
  enviadoEn?: Date;
  proximoIntentoEn?: Date;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Notificacion {
  private readonly _id?: string;
  private readonly _clienteId: string;
  private readonly _vehicleId?: string;
  private readonly _tipo: TipoNotificacion;
  private readonly _canal: CanalEnvio;
  private readonly _asunto: string;
  private readonly _contenido: string;
  private readonly _emailDestino?: string;
  private _estado: EstadoNotificacion;
  private _entregado: boolean;
  private _falloMotivo?: string;
  private _intentos: number;
  private _maxIntentos: number;
  private _enviadoEn?: Date;
  private _proximoIntentoEn?: Date;
  private readonly _metadata?: Record<string, unknown>;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: NotificacionProps) {
    this._id = props.id;
    this._clienteId = props.clienteId;
    this._vehicleId = props.vehicleId;
    this._tipo = props.tipo;
    this._canal = props.canal;
    this._asunto = props.asunto;
    this._contenido = props.contenido;
    this._emailDestino = props.emailDestino;
    this._estado = props.estado ?? EstadoNotificacion.PENDIENTE;
    this._entregado = props.entregado ?? false;
    this._falloMotivo = props.falloMotivo;
    this._intentos = props.intentos ?? 0;
    this._maxIntentos = props.maxIntentos ?? 3;
    this._enviadoEn = props.enviadoEn;
    this._proximoIntentoEn = props.proximoIntentoEn;
    this._metadata = props.metadata;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  get id(): string | undefined {
    return this._id;
  }

  get clienteId(): string {
    return this._clienteId;
  }

  get vehicleId(): string | undefined {
    return this._vehicleId;
  }

  get tipo(): TipoNotificacion {
    return this._tipo;
  }

  get canal(): CanalEnvio {
    return this._canal;
  }

  get asunto(): string {
    return this._asunto;
  }

  get contenido(): string {
    return this._contenido;
  }

  get emailDestino(): string | undefined {
    return this._emailDestino;
  }

  get estado(): EstadoNotificacion {
    return this._estado;
  }

  get entregado(): boolean {
    return this._entregado;
  }

  get falloMotivo(): string | undefined {
    return this._falloMotivo;
  }

  get intentos(): number {
    return this._intentos;
  }

  get maxIntentos(): number {
    return this._maxIntentos;
  }

  get enviadoEn(): Date | undefined {
    return this._enviadoEn;
  }

  get proximoIntentoEn(): Date | undefined {
    return this._proximoIntentoEn;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this._metadata;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  marcarComoEnviada(): void {
    this._estado = EstadoNotificacion.ENVIADA;
    this._entregado = true;
    this._enviadoEn = new Date();
    this._falloMotivo = undefined;
    this._updatedAt = new Date();
  }

  marcarComoLeida(): void {
    this._entregado = true;
    this._updatedAt = new Date();
  }

  marcarComoFallida(error: string): void {
    this._intentos += 1;
    this._falloMotivo = error;
    this._entregado = false;
    this._updatedAt = new Date();

    if (this._intentos >= this._maxIntentos) {
      this._estado = EstadoNotificacion.FALLIDA;
    } else {
      const delayMs = Math.pow(2, this._intentos) * 1000;
      this._proximoIntentoEn = new Date(Date.now() + delayMs);
    }
  }

  estaPendiente(): boolean {
    return this._estado === EstadoNotificacion.PENDIENTE;
  }

  puedeReintentar(): boolean {
    return (
      this._estado !== EstadoNotificacion.ENVIADA &&
      this._intentos < this._maxIntentos
    );
  }

  toProps(): NotificacionProps {
    return {
      id: this._id,
      clienteId: this._clienteId,
      vehicleId: this._vehicleId,
      tipo: this._tipo,
      canal: this._canal,
      asunto: this._asunto,
      contenido: this._contenido,
      emailDestino: this._emailDestino,
      estado: this._estado,
      entregado: this._entregado,
      falloMotivo: this._falloMotivo,
      intentos: this._intentos,
      maxIntentos: this._maxIntentos,
      enviadoEn: this._enviadoEn,
      proximoIntentoEn: this._proximoIntentoEn,
      metadata: this._metadata,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}

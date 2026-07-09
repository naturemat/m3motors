import { DomainEventBase } from '../../../shared/domain/events/DomainEventBase';

export interface VehiclePhotoInfo {
  readonly tipo: string;
  readonly url: string;
}

export interface VehiculoActivadoPayload extends DomainEventBase {
  readonly eventName: 'vehiculo.activado';
  readonly vehicleId: string;
  readonly clienteId: string;
  readonly placa: string;
  readonly marca: string;
  readonly modelo: string;
  readonly anio: number;
  readonly tipoMotor: string;
  readonly fechaActivacion: Date;
  readonly activadoPor: string;
  readonly fotos: ReadonlyArray<VehiclePhotoInfo>;
}

export class VehiculoActivadoEvent {
  static readonly EVENT_NAME = 'vehiculo.activado' as const;

  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly vehicleId: string;
  public readonly clienteId: string;
  public readonly placa: string;
  public readonly marca: string;
  public readonly modelo: string;
  public readonly anio: number;
  public readonly tipoMotor: string;
  public readonly fechaActivacion: Date;
  public readonly activadoPor: string;
  public readonly fotos: ReadonlyArray<VehiclePhotoInfo>;

  constructor(params: {
    vehicleId: string;
    clienteId: string;
    placa: string;
    marca: string;
    modelo: string;
    anio: number;
    tipoMotor: string;
    activadoPor: string;
    fotos: VehiclePhotoInfo[];
  }) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.vehicleId = params.vehicleId;
    this.clienteId = params.clienteId;
    this.placa = params.placa;
    this.marca = params.marca;
    this.modelo = params.modelo;
    this.anio = params.anio;
    this.tipoMotor = params.tipoMotor;
    this.fechaActivacion = new Date();
    this.activadoPor = params.activadoPor;
    this.fotos = Object.freeze([...params.fotos]);
    Object.freeze(this);
  }

  toPayload(): VehiculoActivadoPayload {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: VehiculoActivadoEvent.EVENT_NAME,
      vehicleId: this.vehicleId,
      clienteId: this.clienteId,
      placa: this.placa,
      marca: this.marca,
      modelo: this.modelo,
      anio: this.anio,
      tipoMotor: this.tipoMotor,
      fechaActivacion: this.fechaActivacion,
      activadoPor: this.activadoPor,
      fotos: this.fotos,
    };
  }
}

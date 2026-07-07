import { ClienteId } from '../value-objects/ClienteId';
import { Placa } from '../../../shared/domain/value-objects/Placa';

export type EstadoCliente = 'PENDING' | 'ACTIVATED';

export class Cliente {
  private vehiculosAsociados: Placa[];
  private estado: EstadoCliente;
  private fechaActivacion: Date | null;
  private activadoPor: string | null;

  constructor(
    private readonly id: ClienteId,
    private nombre: string,
    private telefono: string,
    private email: string,
    private telegramChatId: string,
    private readonly fechaPreRegistro: Date = new Date(),
  ) {
    this.validarNombre();
    this.vehiculosAsociados = [];
    this.estado = 'PENDING';
    this.fechaActivacion = null;
    this.activadoPor = null;
  }

  activarCliente(mecanicoId: string): void {
    if (this.estado === 'ACTIVATED') throw new Error('El cliente ya está activado');
    this.estado = 'ACTIVATED';
    this.fechaActivacion = new Date();
    this.activadoPor = mecanicoId;
  }

  asociarNuevoVehiculo(placa: Placa): void {
    this.validarPlacaNoDuplicada(placa);
    this.vehiculosAsociados.push(placa);
  }

  actualizarCanalesContacto(
    telefono: string,
    email: string,
    telegramChatId: string,
  ): void {
    this.validarFormatoEmail(email);
    this.telefono = telefono;
    this.email = email;
    this.telegramChatId = telegramChatId;
  }

  getId(): ClienteId {
    return this.id;
  }

  getNombre(): string {
    return this.nombre;
  }

  getTelefono(): string {
    return this.telefono;
  }

  getEmail(): string {
    return this.email;
  }

  getTelegramChatId(): string {
    return this.telegramChatId;
  }

  getEstado(): EstadoCliente {
    return this.estado;
  }

  getFechaPreRegistro(): Date {
    return this.fechaPreRegistro;
  }

  getFechaActivacion(): Date | null {
    return this.fechaActivacion;
  }

  getActivadoPor(): string | null {
    return this.activadoPor;
  }

  getVehiculosAsociados(): ReadonlyArray<Placa> {
    return Object.freeze([...this.vehiculosAsociados]);
  }

  private validarNombre(): void {
    if (!this.nombre) {
      throw new Error('El nombre es requerido');
    }
  }

  private validarPlacaNoDuplicada(placa: Placa): void {
    const yaExiste = this.vehiculosAsociados.some(
      (p) => p.getValue() === placa.getValue(),
    );
    if (yaExiste) {
      throw new Error('El vehículo ya está asociado a este cliente');
    }
  }

  private validarFormatoEmail(email: string): void {
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('Formato de email inválido');
    }
  }
}

export type EstadoPreRegistro = 'PENDING' | 'EN_ESPERA' | 'ACTIVATED';

export class PreRegisteredCustomer {
  private status: EstadoPreRegistro;
  private fechaActivacion: Date | null;
  private activadoPor: string | null;
  private vehicleId: string | null;

  constructor(
    private readonly id: string,
    private nombre: string,
    private telefono: string,
    private email: string,
    private readonly workshopId: string,
    private licensePlate: string | null = null,
    private readonly fechaPreRegistro: Date = new Date(),
  ) {
    if (!id) throw new Error('El ID del cliente es requerido');
    if (!nombre) throw new Error('El nombre es requerido');
    if (fechaPreRegistro > new Date()) {
      throw new Error('La fecha de pre-registro no puede ser futura');
    }
    this.status = 'PENDING';
    this.fechaActivacion = null;
    this.activadoPor = null;
    this.vehicleId = null;
  }

  activar(mecanicoId: string, vehicleId: string): void {
    if (this.status !== 'PENDING' && this.status !== 'EN_ESPERA') {
      throw new Error(
        'Solo se pueden activar clientes en estado PENDING o EN_ESPERA',
      );
    }
    this.status = 'ACTIVATED';
    this.fechaActivacion = new Date();
    this.activadoPor = mecanicoId;
    this.vehicleId = vehicleId;
  }

  marcarComoEncontrado(): void {
    if (this.status !== 'PENDING') {
      throw new Error(
        'Solo se puede marcar como encontrado clientes en estado PENDING',
      );
    }
    this.status = 'EN_ESPERA';
  }

  actualizarDatos(nombre: string, telefono: string, email: string): void {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre es requerido');
    }
    this.nombre = nombre;
    this.telefono = telefono;
    this.email = email;
  }

  getId(): string {
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

  getWorkshopId(): string {
    return this.workshopId;
  }

  getLicensePlate(): string | null {
    return this.licensePlate;
  }

  getStatus(): EstadoPreRegistro {
    return this.status;
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

  getVehicleId(): string | null {
    return this.vehicleId;
  }
}

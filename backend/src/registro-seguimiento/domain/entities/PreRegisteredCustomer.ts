export type EstadoCliente = 'PENDING' | 'ACTIVATED';

export class PreRegisteredCustomer {
  private status: EstadoCliente;
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
    this.status = 'PENDING';
    this.fechaActivacion = null;
    this.activadoPor = null;
    this.vehicleId = null;
  }

  activar(mecanicoId: string, vehicleId: string): void {
    if (this.status === 'ACTIVATED')
      throw new Error('El cliente ya está activado');
    this.status = 'ACTIVATED';
    this.fechaActivacion = new Date();
    this.activadoPor = mecanicoId;
    this.vehicleId = vehicleId;
  }

  actualizarDatos(nombre: string, telefono: string, email: string): void {
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

  getStatus(): EstadoCliente {
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

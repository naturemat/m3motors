export class Mechanic {
  constructor(
    private readonly id: string,
    private readonly usuarioId: string,
    private readonly workshopId: string,
    private readonly nombre: string,
    private readonly especialidad: string,
    private activo: boolean,
    private readonly fechaCreacion: Date,
    private readonly creadoPor: string,
  ) {
    if (!id) throw new Error('El ID del mecánico es requerido');
    if (!nombre) throw new Error('El nombre del mecánico es requerido');
    if (!workshopId) throw new Error('El workshopId es requerido');
    if (!especialidad || especialidad.trim() === '') {
      throw new Error('La especialidad es requerida');
    }
    if (fechaCreacion > new Date()) {
      throw new Error('La fecha de creación no puede ser futura');
    }
  }

  activarCliente(_preRegisteredCustomerId: string): void {
    if (!this.activo) throw new Error('El mecánico no está activo');
  }

  registrarServicio(_intervencionId: string): void {
    if (!this.activo) throw new Error('El mecánico no está activo');
  }

  escannearQR(qrCode: string): string {
    if (!this.activo) throw new Error('El mecánico no está activo');
    return qrCode;
  }

  desactivar(): void {
    this.activo = false;
  }

  getId(): string {
    return this.id;
  }

  getUsuarioId(): string {
    return this.usuarioId;
  }

  getWorkshopId(): string {
    return this.workshopId;
  }

  getNombre(): string {
    return this.nombre;
  }

  getEspecialidad(): string {
    return this.especialidad;
  }

  isActivo(): boolean {
    return this.activo;
  }

  getFechaCreacion(): Date {
    return this.fechaCreacion;
  }

  getCreadoPor(): string {
    return this.creadoPor;
  }
}

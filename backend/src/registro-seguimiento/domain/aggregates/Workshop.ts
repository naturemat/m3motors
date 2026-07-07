import { Mechanic } from '../entities/Mechanic';

export class Workshop {
  private mecanicos: Mechanic[];

  constructor(
    private readonly id: string,
    private readonly nombre: string,
    private readonly ownerId: string,
    private direccion: string,
    private telefono: string,
    private email: string,
    private horarios: string,
    private serviciosOfrecidos: string[],
    private readonly fechaRegistro: Date = new Date(),
  ) {
    if (!id) throw new Error('El ID del taller es requerido');
    if (!nombre) throw new Error('El nombre del taller es requerido');
    if (!ownerId) throw new Error('El ownerId es requerido');
    this.mecanicos = [];
  }

  agregarMecanico(mecanico: Mechanic): void {
    const yaExiste = this.mecanicos.some((m) => m.getId() === mecanico.getId());
    if (yaExiste)
      throw new Error('El mecánico ya está registrado en este taller');
    this.mecanicos.push(mecanico);
  }

  removerMecanico(mecanicoId: string): void {
    const index = this.mecanicos.findIndex((m) => m.getId() === mecanicoId);
    if (index === -1) throw new Error('Mecánico no encontrado en este taller');
    this.mecanicos.splice(index, 1);
  }

  configurarServicios(servicios: string[]): void {
    this.serviciosOfrecidos = servicios;
  }

  actualizarHorarios(horarios: string): void {
    this.horarios = horarios;
  }

  obtenerMecanicoPorId(mecanicoId: string): Mechanic | undefined {
    return this.mecanicos.find((m) => m.getId() === mecanicoId);
  }

  listarMecanicosActivos(): Mechanic[] {
    return this.mecanicos.filter((m) => m.isActivo());
  }

  getId(): string {
    return this.id;
  }

  getNombre(): string {
    return this.nombre;
  }

  getOwnerId(): string {
    return this.ownerId;
  }

  getDireccion(): string {
    return this.direccion;
  }

  getTelefono(): string {
    return this.telefono;
  }

  getEmail(): string {
    return this.email;
  }

  getHorarios(): string {
    return this.horarios;
  }

  getServiciosOfrecidos(): string[] {
    return [...this.serviciosOfrecidos];
  }

  getMecanicos(): Mechanic[] {
    return [...this.mecanicos];
  }

  getFechaRegistro(): Date {
    return this.fechaRegistro;
  }
}

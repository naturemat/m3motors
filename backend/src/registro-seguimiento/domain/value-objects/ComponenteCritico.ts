export type EstadoComponente = 'OPTIMO' | 'DESGASTE_MEDIO' | 'CRITICO';

export class ComponenteCritico {
  private estadoActual: EstadoComponente;

  constructor(
    private readonly id: string,
    private readonly nombre: string,
    private readonly kilometrajeInstalacion: number,
    private readonly limiteKilometrajeFabricante: number,
    private readonly fechaInstalacion: Date = new Date(),
    estadoInicial: EstadoComponente = 'OPTIMO',
  ) {
    if (!id) throw new Error('El ID del componente es requerido');
    if (!nombre) throw new Error('Nombre del componente es requerido');
    if (kilometrajeInstalacion < 0)
      throw new Error('El kilometraje de instalación no puede ser negativo');
    if (limiteKilometrajeFabricante <= 0)
      throw new Error(
        'El límite de kilometraje del fabricante debe ser mayor a 0',
      );
    if (fechaInstalacion > new Date()) {
      throw new Error('La fecha de instalación no puede ser futura');
    }
    this.estadoActual = estadoInicial;
  }

  calcularDesgaste(kilometrajeActual: number): number {
    const recorrido = kilometrajeActual - this.kilometrajeInstalacion;
    return Math.min(100, (recorrido / this.limiteKilometrajeFabricante) * 100);
  }

  actualizarEstado(kilometrajeActual: number): void {
    const porcentaje = this.calcularDesgaste(kilometrajeActual);

    if (porcentaje >= 90) {
      this.estadoActual = 'CRITICO';
    } else if (porcentaje >= 50) {
      this.estadoActual = 'DESGASTE_MEDIO';
    } else {
      this.estadoActual = 'OPTIMO';
    }
  }

  getId(): string {
    return this.id;
  }

  getNombre(): string {
    return this.nombre;
  }

  getKilometrajeInstalacion(): number {
    return this.kilometrajeInstalacion;
  }

  getLimiteKilometrajeFabricante(): number {
    return this.limiteKilometrajeFabricante;
  }

  getFechaInstalacion(): Date {
    return this.fechaInstalacion;
  }

  getEstadoActual(): EstadoComponente {
    return this.estadoActual;
  }
}

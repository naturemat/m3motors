export class ComponenteCritico {
  constructor(
    private readonly nombre: string,
    private readonly tiempoVidaUtilMeses: number
  ) {
    if (!nombre) throw new Error('Nombre del componente es requerido');
    if (tiempoVidaUtilMeses <= 0) throw new Error('Vida útil debe ser mayor a 0');
  }
  getNombre(): string { return this.nombre; }
  getTiempoVidaUtilMeses(): number { return this.tiempoVidaUtilMeses; }
}
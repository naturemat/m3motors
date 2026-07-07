export class TasaDesgaste {
  private readonly porcentaje: number;
  constructor(porcentaje: number) {
    if (porcentaje < 0 || porcentaje > 100)
      throw new Error('Tasa de desgaste debe estar entre 0 y 100');
    this.porcentaje = porcentaje;
  }
  getPorcentaje(): number {
    return this.porcentaje;
  }
}

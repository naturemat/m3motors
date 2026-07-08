export type MetodoCalculo = 'REGRESION_LINEAL' | 'PROMEDIO_MOVIL_DISCRETO';

export class TasaDesgaste {
  constructor(
    private readonly kilometrosSemanales: number,
    private readonly fechaCalculo: Date,
    private readonly metodo: MetodoCalculo,
    private readonly nivelConfianza: number = 1.0,
  ) {
    if (kilometrosSemanales < 0) {
      throw new Error('Los kilómetros semanales no pueden ser negativos');
    }
    if (fechaCalculo > new Date()) {
      throw new Error('La fecha de cálculo no puede ser futura');
    }
    if (!['REGRESION_LINEAL', 'PROMEDIO_MOVIL_DISCRETO'].includes(metodo)) {
      throw new Error('Método de cálculo inválido');
    }
    if (nivelConfianza < 0 || nivelConfianza > 1) {
      throw new Error('El nivel de confianza debe estar entre 0 y 1');
    }
  }

  getKilometrosSemanales(): number {
    return this.kilometrosSemanales;
  }

  getFechaCalculo(): Date {
    return this.fechaCalculo;
  }

  getMetodo(): MetodoCalculo {
    return this.metodo;
  }

  getNivelConfianza(): number {
    return this.nivelConfianza;
  }

  equals(other: TasaDesgaste): boolean {
    return (
      this.kilometrosSemanales === other.kilometrosSemanales &&
      this.fechaCalculo.getTime() === other.fechaCalculo.getTime() &&
      this.metodo === other.metodo
    );
  }
}

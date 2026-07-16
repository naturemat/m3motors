export class Periodo {
  private constructor(
    public readonly inicio: Date,
    public readonly fin: Date,
  ) {}

  static ultimoMes(): Periodo {
    const fin = new Date();
    const inicio = new Date();
    inicio.setMonth(inicio.getMonth() - 1);
    return new Periodo(inicio, fin);
  }

  static ultimosTresMeses(): Periodo {
    const fin = new Date();
    const inicio = new Date();
    inicio.setMonth(inicio.getMonth() - 3);
    return new Periodo(inicio, fin);
  }

  static ultimoAnio(): Periodo {
    const fin = new Date();
    const inicio = new Date();
    inicio.setFullYear(inicio.getFullYear() - 1);
    return new Periodo(inicio, fin);
  }

  static personalizado(inicio: Date, fin: Date): Periodo {
    return new Periodo(inicio, fin);
  }
}

export class RegistroKilometraje {
  constructor(
    private readonly valorKm: number,
    private readonly fecha: Date,
  ) {
    if (valorKm < 0) throw new Error('El kilometraje no puede ser negativo');
  }
  getValorKm(): number {
    return this.valorKm;
  }
  getFecha(): Date {
    return this.fecha;
  }
}

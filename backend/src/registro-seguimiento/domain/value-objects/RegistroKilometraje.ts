export class RegistroKilometraje {
  constructor(
    private readonly valorKm: number,
    private readonly fecha: Date,
  ) {
    if (valorKm < 0) throw new Error('El kilometraje no puede ser negativo');
    if (fecha > new Date()) {
      throw new Error('La fecha del registro no puede ser futura');
    }
  }

  getValorKm(): number {
    return this.valorKm;
  }

  getFecha(): Date {
    return this.fecha;
  }

  equals(other: RegistroKilometraje): boolean {
    return (
      this.valorKm === other.valorKm &&
      this.fecha.getTime() === other.fecha.getTime()
    );
  }
}

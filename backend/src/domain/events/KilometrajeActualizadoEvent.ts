export class KilometrajeActualizadoEvent {
  static readonly EVENT_NAME = 'kilometraje.actualizado';

  constructor(
    public readonly placa: string,
    public readonly nuevoKilometraje: number,
    public readonly fecha: Date,
  ) {}
}

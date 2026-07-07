export class AlertaGeneradaEvent {
  static readonly EVENT_NAME = 'alerta.generada';

  constructor(
    public readonly placa: string,
    public readonly tipo: string,
    public readonly mensaje: string,
    public readonly nivel: string,
    public readonly fecha: Date,
  ) {
    Object.freeze(this);
  }
}

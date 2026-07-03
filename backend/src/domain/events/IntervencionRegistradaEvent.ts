export class IntervencionRegistradaEvent {
  static readonly EVENT_NAME = 'intervencion.registrada';

  constructor(
    public readonly intervencionId: string,
    public readonly placa: string,
    public readonly fecha: Date,
    public readonly diagnostico: string,
  ) {}
}

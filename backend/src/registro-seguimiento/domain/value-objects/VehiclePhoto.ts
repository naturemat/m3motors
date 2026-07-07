export type TipoFoto = 'FRONTAL' | 'LATERAL' | 'PLACA';

export class VehiclePhoto {
  constructor(
    private readonly url: string,
    private readonly tipo: TipoFoto,
    private readonly fechaCaptura: Date,
    private readonly capturadoPor: string,
    private readonly descripcion?: string,
  ) {
    if (!url) throw new Error('La URL de la foto es requerida');
    if (!this.esTipoValido(tipo))
      throw new Error(`Tipo de foto inválido: ${tipo as string}`);
  }

  private esTipoValido(tipo: string): tipo is TipoFoto {
    return ['FRONTAL', 'LATERAL', 'PLACA'].includes(tipo);
  }

  getUrl(): string {
    return this.url;
  }

  getTipo(): TipoFoto {
    return this.tipo;
  }

  getFechaCaptura(): Date {
    return this.fechaCaptura;
  }

  getCapturadoPor(): string {
    return this.capturadoPor;
  }

  getDescripcion(): string | undefined {
    return this.descripcion;
  }
}

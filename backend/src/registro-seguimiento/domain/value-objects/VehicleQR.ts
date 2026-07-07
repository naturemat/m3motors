export class VehicleQR {
  constructor(
    private readonly codigo: string,
    private readonly fechaGeneracion: Date,
    private readonly url: string,
  ) {
    if (!codigo) throw new Error('El código del QR es requerido');
    if (!url) throw new Error('La URL del QR es requerida');
  }

  esValido(): boolean {
    return this.codigo.startsWith('QR-') && this.codigo.length === 11;
  }

  generarUrl(): string {
    return this.url;
  }

  getCodigo(): string {
    return this.codigo;
  }

  getFechaGeneracion(): Date {
    return this.fechaGeneracion;
  }

  getUrl(): string {
    return this.url;
  }
}

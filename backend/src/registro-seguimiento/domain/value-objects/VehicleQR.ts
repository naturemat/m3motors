export class VehicleQR {
  constructor(
    private readonly codigo: string,
    private readonly fechaGeneracion: Date,
    private readonly url: string,
  ) {
    if (!codigo) throw new Error('El código del QR es requerido');
    if (!/^QR-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codigo)) {
      throw new Error('Código QR inválido. Formato esperado: QR-XXXX-XXXX');
    }
    if (fechaGeneracion > new Date()) {
      throw new Error('La fecha de generación no puede ser futura');
    }
    if (!url) throw new Error('La URL del QR es requerida');
    try {
      new URL(url);
    } catch {
      throw new Error('La URL del QR no tiene un formato válido');
    }
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

  equals(other: VehicleQR): boolean {
    return this.codigo === other.codigo;
  }
}

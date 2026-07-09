export type NivelSeveridad = 'BAJA' | 'MEDIA' | 'ALTA';

export class DiagnosticoTecnico {
  constructor(
    private readonly fallaDetectada: string,
    private readonly nivelSeveridad: NivelSeveridad,
    private readonly observacionesMecanico: string = '',
  ) {
    if (!fallaDetectada || fallaDetectada.trim() === '') {
      throw new Error('La falla detectada es requerida');
    }
    if (!['BAJA', 'MEDIA', 'ALTA'].includes(nivelSeveridad)) {
      throw new Error(
        'Nivel de severidad inválido. Valores: BAJA, MEDIA, ALTA',
      );
    }
  }

  getFallaDetectada(): string {
    return this.fallaDetectada;
  }

  getObservacionesMecanico(): string {
    return this.observacionesMecanico;
  }

  getNivelSeveridad(): NivelSeveridad {
    return this.nivelSeveridad;
  }

  equals(other: DiagnosticoTecnico): boolean {
    return (
      this.fallaDetectada === other.fallaDetectada &&
      this.nivelSeveridad === other.nivelSeveridad &&
      this.observacionesMecanico === other.observacionesMecanico
    );
  }
}

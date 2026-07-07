export type NivelSeveridad = 'BAJA' | 'MEDIA' | 'ALTA';

export class DiagnosticoTecnico {
  constructor(
    private readonly fallaDetectada: string,
    private readonly observacionesMecanico: string,
    private readonly nivelSeveridad: NivelSeveridad,
  ) {
    if (!fallaDetectada || fallaDetectada.trim() === '') {
      throw new Error('La falla detectada es requerida');
    }
    if (!observacionesMecanico || observacionesMecanico.trim() === '') {
      throw new Error('Las observaciones del mecánico son requeridas');
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
}

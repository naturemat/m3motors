export type SeveridadPrediccion = 'BAJA' | 'MEDIA' | 'CRITICA';

export interface AlertaGeneradaPayload {
  readonly eventName: 'alerta.generada';
  readonly vehicleId: string;
  readonly placa: string;
  readonly clienteId: string;
  readonly componenteAfectado: string;
  readonly kilometrajeActual: number;
  readonly kilometrajeLimite: number;
  readonly semanasEstimadasRestantes: number;
  readonly mesesEstimadosRestantes: number;
  readonly mensajePrediccion: string;
  readonly nivelSeveridad: SeveridadPrediccion;
  readonly recomendacion: string;
}

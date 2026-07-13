export interface ContextoVehiculo {
  vehicleId: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  kilometrajeActual: number;
  kmPorSemana: number;
  componentesCriticos: {
    nombre: string;
    kilometrajeInstalacion: number;
    limiteKilometraje: number;
  }[];
}

export interface AlertaPrediccion {
  componenteAfectado: string;
  kilometrajeActual: number;
  kilometrajeLimite: number;
  semanasEstimadas: number;
  mesesEstimados: number;
  mensajePrediccion: string;
  severidad: 'BAJA' | 'MEDIA' | 'CRITICA';
  recomendacion: string;
}

export interface ServicioPrediccionLLM {
  predecir(contexto: ContextoVehiculo): Promise<AlertaPrediccion>;
}

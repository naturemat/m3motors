export interface DetalleComponenteDTO {
  componenteReemplazado: string;
  limiteKilometraje: number;
  tipoServicio: string;
}

export interface CreateInterventionDTO {
  vehiculoId: string;
  serviceCatalogId: string;
  kilometrajeOdometro: number;
  diagnostico: string;
  observaciones?: string;
  severidad: string;
  manoDeObra: number;
  detalles: DetalleComponenteDTO[];
}

export interface VehiculoInfo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  kilometrajeActual: number;
}

export interface DetalleComponenteDTO {
  componenteReemplazado: string;
  limiteKilometraje?: number;
  tipoServicio: string; // Ej: 'REEMPLAZO', 'MANTENIMIENTO'
}

export interface CreateInterventionDTO {
  vehiculoId: number;
  serviceCatalogId?: number;
  kilometrajeOdometro: number;
  diagnostico: string;
  observaciones?: string;
  severidad: 'BAJA' | 'MEDIA' | 'ALTA';
  manoDeObra: number;
  detalles?: DetalleComponenteDTO[];
}

export interface VehiculoInfo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  kilometrajeActual: number;
}
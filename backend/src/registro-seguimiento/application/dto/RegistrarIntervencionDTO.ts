export interface ComponenteDTO {
  nombre: string;
  kilometrajeInstalacion: number;
  limiteKilometrajeFabricante: number;
}

export interface RegistrarIntervencionDTO {
  placa: string;
  fecha: Date;
  kilometrajeActual: number;
  diagnostico: string;
  observacionesMecanico: string;
  nivelSeveridad: 'BAJA' | 'MEDIA' | 'ALTA';
  componentes: ComponenteDTO[];
  mecanicoId: string;
  manoDeObra: number;
}

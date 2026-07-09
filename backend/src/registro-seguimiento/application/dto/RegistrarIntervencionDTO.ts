import { NivelSeveridad } from '../../domain/events/IntervencionRegistradaEvent';

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
  nivelSeveridad: NivelSeveridad;
  componentes: ComponenteDTO[];
  mecanicoId: string;
  workshopId: string;
  manoDeObra: number;
}

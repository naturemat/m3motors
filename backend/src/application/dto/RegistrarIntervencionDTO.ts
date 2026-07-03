export interface ComponenteDTO {
  nombre: string;
  tiempoVidaUtilMeses: number;
}

export interface RegistrarIntervencionDTO {
  placa: string;
  fecha: Date;
  kilometrajeActual: number;
  diagnostico: string;
  componentes: ComponenteDTO[];
  mecanicoId: string;
  manoDeObra: number;
}

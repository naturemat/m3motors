import api from './api';

export interface ComponenteCriticoData {
  id: string;
  nombre: string;
  kilometrajeInstalacion: number;
  limiteKilometrajeFabricante: number;
  porcentajeDesgaste: number;
  estado: 'OPTIMO' | 'DESGASTE_MEDIO' | 'CRITICO';
}

export interface IntervencionData {
  id: string;
  fecha: string;
  diagnostico: string;
  observaciones: string;
  nivelSeveridad: string;
  manoDeObra: number;
  mecanicoId: string;
  estado: 'PENDIENTE' | 'FINALIZADO';
  componentes: ComponenteCriticoData[];
}

export interface ClienteData {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
}

export interface VehiculoHistorialData {
  vehicleId: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoMotor: string;
  kilometrajeActual: number | null;
  tasaDesgasteSemanal: number;
  proximoMantenimiento: string | null;
  cliente: ClienteData | null;
  intervenciones: IntervencionData[];
  estadoGeneral: 'OPTIMO' | 'ATENCION' | 'CRITICO';
  mensajeEstado: string;
}

export async function fetchHistorialByQR(qrCode: string): Promise<VehiculoHistorialData> {
  const response = await api.get(`/vehicles/qr/${qrCode}`);
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  return response.data;
}

export async function fetchHistorialByVehicleId(vehicleId: string): Promise<VehiculoHistorialData> {
  const response = await api.get(`/vehicles/${vehicleId}/history`);
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  return response.data;
}

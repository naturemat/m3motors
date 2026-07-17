import api from './api';

export interface ComponenteCriticoData {
  id: string;
  componente: string;
  kilometrajeInstalacion: number;
  limiteKilometraje: number;
  desgaste: number;
  estado: string;
}

export interface IntervencionData {
  id: string;
  fecha: string;
  servicio: string;
  mecanico: string;
  kilometraje: number;
  componentes: string[];
  costo: number;
  diagnostico: string;
  observaciones?: string;
  severidad: string;
}

export interface ClienteData {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
}

export interface VehiculoHistorialData {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  ultimoKilometraje: number;
  tasaDesgaste: number;
  estadoAlerta: string;
  cliente: ClienteData;
  componentesCriticos: ComponenteCriticoData[];
  intervenciones: IntervencionData[];
}

export async function fetchHistorialByQR(qrCode: string): Promise<VehiculoHistorialData> {
  const { data } = await api.get(`/vehicles/qr/${qrCode}`);
  return data;
}

export async function fetchHistorialByVehicleId(vehicleId: string): Promise<VehiculoHistorialData> {
  const { data } = await api.get(`/vehicles/${vehicleId}/history`);
  return data;
}

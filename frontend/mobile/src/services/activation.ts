import api from './api';

export interface VehiclePhotoData {
  tipo: 'frontal' | 'lateral' | 'placa';
  base64: string;
}

export interface ActivationRequest {
  customerId: string;
  workshopId: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoMotor: string;
  fotos: VehiclePhotoData[];
}

export interface ActivationResponse {
  success: boolean;
  vehicleId: string;
  placa: string;
  qr: {
    codigo: string;
    url: string;
  };
}

export async function activateClient(
  data: ActivationRequest,
): Promise<ActivationResponse> {
  const response = await api.post<ActivationResponse>(
    '/activation/activate-client',
    data,
  );
  return response.data;
}

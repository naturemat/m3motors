import { VehicleQR } from '../value-objects/VehicleQR';
import { VehiclePhoto } from '../value-objects/VehiclePhoto';

export interface ResultadoActivacion {
  vehicleId: string;
  placa: string;
  qr: VehicleQR;
  fotos: VehiclePhoto[];
}

export interface ServicioActivacionCliente {
  ejecutar(
    preRegisteredCustomerId: string,
    workshopId: string,
    mechanicId: string,
    fotos: VehiclePhoto[],
  ): Promise<ResultadoActivacion>;
}

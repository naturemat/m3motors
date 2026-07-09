import { VehicleQR } from '../value-objects/VehicleQR';

export interface ServicioGeneracionQR {
  generarQR(vehicleId: string): VehicleQR;
}

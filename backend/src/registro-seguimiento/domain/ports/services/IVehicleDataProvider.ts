export interface DatosVehiculoExterno {
  placa: string;
  vin: string;
  codigoMotor: string;
  marca: string;
  modelo: string;
  anio: number;
  paisFabricacion: string;
  color: string;
  claseVehiculo: string;
  tipoVehiculo: string;
}

export interface IVehicleDataProvider {
  obtenerDatosVehiculo(placa: string): Promise<DatosVehiculoExterno>;
}

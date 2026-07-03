export interface RegistrarIngresoVehicularDTO {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoMotor: string;
  kilometrajeInicial: number;
  fechaIngreso?: Date;
}

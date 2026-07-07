export interface RegistrarIngresoVehicularDTO {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoMotor: string;
  clienteId: string;
  kilometrajeInicial: number;
  fechaIngreso?: Date;
}

export interface KPIsTaller {
  totalVehiculos: number;
  totalClientesActivos: number;
  ingresosMes: number;
  ingresosTotales: number;
  calificacionPromedio: number;
  totalServicios: number;
  totalMecanicos: number;
  totalAlertasActivas: number;
  intervencionesMes: number;
  totalOrders: number;
}

export interface KPIsMecanico {
  totalIntervenciones: number;
  intervencionesMes: number;
  vehiculosAtendidos: number;
  clientesAtendidos: number;
  ingresosGenerados: number;
  alertasAsignadas: number;
}

export interface KPIsCliente {
  totalVehiculos: number;
  totalIntervenciones: number;
  proximoMantenimiento: string | null;
  kilometrajeActual: number;
  alertasActivas: number;
  historialReciente: {
    fecha: string;
    servicio: string;
    mecanico: string;
  }[];
}

export interface Client {
  id: string;
  idCard: string;
  name: string;
  email: string;
  phone: string;
  plate: string;
  lastService: string;
  status: 'Activo' | 'Pendiente';
  vehicleModel: string;
}

export interface Mechanic {
  id: string;
  idCard: string;
  name: string;
  specialty: string;
  workload: number;
  status: 'Activo' | 'Inactivo';
}

export interface ServiceOrder {
  id: string;
  clientName: string;
  clientInitials: string;
  vehicle: string;
  serviceName: string;
  status: 'EN PROGRESO' | 'COMPLETADO' | 'PENDIENTE';
  total: number;
  date: string;
}

export interface KPIs {
  totalVehiculos: number;
  totalClientesActivos: number;
  ingresosMes: number;
  calificacionPromedio: number;
  totalServicios: number;
  totalMecanicos: number;
  totalAlertasActivas: number;
  intervencionesMes: number;
}

export interface MonthlyRevenue {
  month: string;
  amount: number;
}

export interface ClientEvolution {
  month: string;
  count: number;
}

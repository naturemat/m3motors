export type UserRole = 'mechanic' | 'client' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  foto?: string;
  ultimoKilometraje: number;
  tasaDesgaste: number;
  proximoMantenimiento: {
    km: number;
    semanas: number;
  };
  qrCode: string;
  totalIntervenciones: number;
}

export interface Intervention {
  id: string;
  fecha: string;
  servicio: string;
  mecanico: string;
  kilometraje: number;
  componentes: string[];
  costo?: number;
  diagnostico?: string;
  observaciones?: string;
  severidad?: 'BAJA' | 'MEDIA' | 'ALTA';
}

export interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  component: string;
  days: number;
}

export interface Customer {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  licensePlate?: string;
  vehicleId?: string;
  status: 'pending' | 'active';
}

export interface DashboardData {
  appointmentsToday: number;
  customersInShop: number;
  pendingCustomers: number;
  unreadNotifications: number;
}

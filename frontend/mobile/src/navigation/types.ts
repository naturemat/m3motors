export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type MechanicStackParamList = {
  MechanicDashboard: undefined;
  QRScanner: undefined;
  ActivateCustomer: {customerId: string};
  VehicleHistory: {vehicleId: string};
  NewService: {vehicleId: string};
  CustomerSearch: undefined;
  ServiceRegistration: { 
  vehiculoId?: number; 
  placa?: string; 
  marca?: string; 
  modelo?: string; 
  kilometrajeActual?: number; 
} | undefined;
};

export type ClientStackParamList = {
  ClientDashboard: undefined;
  ClientHistory: undefined;
  ClientQR: undefined;
  UpdateKM: undefined;
  ClientProfile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MechanicApp: undefined;
  ClientApp: undefined;
};

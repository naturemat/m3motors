import {UserRole} from '../types';

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type MechanicStackParamList = {
  MechanicDashboard: undefined;
  ActivateCustomer: {customerId: string};
  VehicleHistory: {vehicleId: string};
  NewService: {vehicleId: string};
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

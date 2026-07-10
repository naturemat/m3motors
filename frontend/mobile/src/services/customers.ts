import api from './api';
import {Customer} from '../types';

export interface SearchCustomersParams {
  q?: string;
  status?: 'PENDING' | 'ACTIVATED' | 'ALL';
  skip?: number;
  take?: number;
  orderBy?: 'date_desc' | 'name_asc' | 'name_desc';
}

export interface SearchCustomersResponse {
  data: Customer[];
  meta: {
    total: number;
    skip: number;
    take: number;
  };
}

interface PreRegisteredCustomerApiItem {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  licensePlate?: string | null;
  status: string;
  fechaPreRegistro: string;
  idVehiculoConverted?: number | null;
}

export const customersService = {
  searchPreRegisteredCustomers: async (
    params: SearchCustomersParams,
  ): Promise<SearchCustomersResponse> => {
    const response = await api.get<{
      data: PreRegisteredCustomerApiItem[];
      meta: SearchCustomersResponse['meta'];
    }>('/activation/pre-registered', {params});

    const mappedData: Customer[] = response.data.data.map(item => ({
      id: String(item.id),
      nombre: item.nombre,
      telefono: item.telefono,
      email: item.email,
      licensePlate: item.licensePlate ?? undefined,
      status: item.status === 'PENDING' ? 'pending' : 'active',
      vehicleId: item.idVehiculoConverted
        ? String(item.idVehiculoConverted)
        : undefined,
      fechaPreRegistro: item.fechaPreRegistro,
    }));

    return {
      data: mappedData,
      meta: response.data.meta,
    };
  },
};

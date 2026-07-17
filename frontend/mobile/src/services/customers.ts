import api from './api';
import type { Customer } from '@/types';

export const customersService = {
  async searchPreRegisteredCustomers(params?: {
    q?: string;
    status?: string;
    skip?: number;
    take?: number;
    orderBy?: string;
  }): Promise<Customer[]> {
    const { data } = await api.get('/activation/pre-registered', { params });
    return Array.isArray(data) ? data : data.data ?? [];
  },
};

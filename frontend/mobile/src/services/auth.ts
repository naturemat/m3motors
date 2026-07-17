import api from './api';

export const authService = {
  async getMe(): Promise<{ id: string; email: string; firstName: string; lastName: string; role: string }> {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

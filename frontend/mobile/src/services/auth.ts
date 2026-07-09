import api from './api';
import {User} from '../types';

export const authService = {
  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

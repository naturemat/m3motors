import api from './api'; // 👈 Asegúrate de que apunte a tu instancia configurada de Axios
import { CreateInterventionDTO, VehiculoInfo } from '../types/intervention.types';

export const InterventionService = {
  /**
   * Obtiene la información de un vehículo por su placa o código QR
   */
  buscarVehiculoPorPlacaOQR: async (criterio: string): Promise<VehiculoInfo> => {
    const response = await api.get(`/vehicles/search?query=${criterio}`);
    return response.data;
  },

  /**
   * Obtiene el catálogo de servicios configurados en el taller
   */
  obtenerCatalogoServicios: async () => {
    const response = await api.get('/service-catalog');
    return response.data;
  },

  /**
   * Envía el formulario completo de la intervención mecánica al backend
   */
  registrarIntervencion: async (data: CreateInterventionDTO) => {
    const response = await api.post('/interventions', data);
    return response.data;
  }
};
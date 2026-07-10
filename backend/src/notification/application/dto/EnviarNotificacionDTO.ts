import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';
import { TipoNotificacion } from '../../domain/value-objects/TipoNotificacion';

export interface EnviarNotificacionDTO {
  clienteId: string;
  vehicleId?: string;
  tipo: TipoNotificacion;
  canal: CanalEnvio;
  asunto: string;
  contenido: string;
  metadata?: Record<string, unknown>;
}

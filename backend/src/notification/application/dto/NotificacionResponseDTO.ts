import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';
import { EstadoNotificacion } from '../../domain/value-objects/EstadoNotificacion';
import { TipoNotificacion } from '../../domain/value-objects/TipoNotificacion';

export interface NotificacionResponseDTO {
  id: string;
  clienteId: string;
  vehicleId?: string;
  tipo: TipoNotificacion;
  canal: CanalEnvio;
  asunto: string;
  contenido: string;
  estado: EstadoNotificacion;
  entregado: boolean;
  falloMotivo?: string;
  intentos: number;
  maxIntentos: number;
  enviadoEn?: Date;
  createdAt: Date;
  updatedAt: Date;
}

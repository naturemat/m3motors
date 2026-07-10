import { Notificacion } from '../entities/Notificacion';

export abstract class INotificationRepository {
  abstract save(notificacion: Notificacion): Promise<Notificacion>;
  abstract findById(id: string): Promise<Notificacion | null>;
  abstract findByClienteId(clienteId: string): Promise<Notificacion[]>;
  abstract findPendientes(): Promise<Notificacion[]>;
  abstract findFallidasParaReintentar(): Promise<Notificacion[]>;
  abstract update(notificacion: Notificacion): Promise<void>;
  abstract countByClienteAndTipo(
    clienteId: string,
    tipo: string,
  ): Promise<number>;
}

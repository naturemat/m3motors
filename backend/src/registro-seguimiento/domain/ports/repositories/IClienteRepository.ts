import { Cliente } from '../../entities/Cliente';
import { ClienteId } from '../../value-objects/ClienteId';

export interface IClienteRepository {
  findById(id: ClienteId): Promise<Cliente | null>;
  findAll(): Promise<Cliente[]>;
  save(cliente: Cliente): Promise<void>;
}

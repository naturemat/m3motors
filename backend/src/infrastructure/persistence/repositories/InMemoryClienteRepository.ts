import { Injectable } from '@nestjs/common';
import { IClienteRepository } from '../../../domain/ports/repositories/IClienteRepository';
import { Cliente } from '../../../domain/entities/Cliente';
import { ClienteId } from '../../../domain/value-objects/ClienteId';

@Injectable()
export class InMemoryClienteRepository implements IClienteRepository {
  private readonly clientes: Map<string, Cliente> = new Map();

  findById(id: ClienteId): Promise<Cliente | null> {
    return Promise.resolve(this.clientes.get(id.getValue()) ?? null);
  }

  findAll(): Promise<Cliente[]> {
    return Promise.resolve(Array.from(this.clientes.values()));
  }

  save(cliente: Cliente): Promise<void> {
    this.clientes.set(cliente.getId().getValue(), cliente);
    return Promise.resolve();
  }
}

import { Injectable } from '@nestjs/common';
import { IClienteRepository } from '../../../domain/ports/repositories/IClienteRepository';
import { Cliente } from '../../../domain/entities/Cliente';
import { ClienteId } from '../../../domain/value-objects/ClienteId';

@Injectable()
export class InMemoryClienteRepository implements IClienteRepository {
  private readonly clientes: Map<string, Cliente> = new Map();

  async findById(id: ClienteId): Promise<Cliente | null> {
    return this.clientes.get(id.getValue()) ?? null;
  }

  async findAll(): Promise<Cliente[]> {
    return Array.from(this.clientes.values());
  }

  async save(cliente: Cliente): Promise<void> {
    this.clientes.set(cliente.getId().getValue(), cliente);
  }
}

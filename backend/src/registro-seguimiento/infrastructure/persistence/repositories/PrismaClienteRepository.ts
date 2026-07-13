/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { IClienteRepository } from '../../../domain/ports/repositories/IClienteRepository';
import { Cliente } from '../../../domain/entities/Cliente';
import { ClienteId } from '../../../domain/value-objects/ClienteId';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaClienteRepository implements IClienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: ClienteId): Promise<Cliente | null> {
    const row = await this.prisma.client$.cliente.findUnique({
      where: { id: Number(id.getValue()) },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Cliente[]> {
    const rows = await this.prisma.client$.cliente.findMany();
    return rows.map((row: any) => this.toDomain(row));
  }

  async save(cliente: Cliente): Promise<void> {
    const data = {
      clerkId: cliente.getId().getValue(),
      nombre: cliente.getNombre(),
      telefono: cliente.getTelefono(),
      email: cliente.getEmail(),
      status: cliente.getEstado(),
      fechaActivacion: cliente.getFechaActivacion(),
      idMecanicoActivo: Number(cliente.getActivadoPor() ?? '0'),
    };

    await this.prisma.client$.cliente.upsert({
      where: { clerkId: cliente.getId().getValue() },
      update: data,
      create: data,
    });
  }

  private toDomain(row: any): Cliente {
    const cliente = new Cliente(
      new ClienteId(String(row.id)),
      row.nombre,
      row.telefono,
      row.email,
      '',
      row.createdAt ?? new Date(),
    );
    return cliente;
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { IVehiculoRepository } from '../../../domain/ports/repositories/IVehiculoRepository';
import { Vehiculo } from '../../../domain/aggregates/Vehiculo';
import { Placa } from '../../../../shared/domain/value-objects/Placa';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaVehiculoRepository implements IVehiculoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPlaca(placa: Placa): Promise<Vehiculo | null> {
    const row = await this.prisma.client$.vehicle.findUnique({
      where: { placa: placa.getValue() },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Vehiculo[]> {
    const rows = await this.prisma.client$.vehicle.findMany();
    return rows.map((row: any) => this.toDomain(row));
  }

  async save(vehiculo: Vehiculo): Promise<void> {
    const data = {
      placa: vehiculo.getPlaca().getValue(),
      marca: vehiculo.getMarca(),
      modelo: vehiculo.getModelo(),
      anio: vehiculo.getAnio(),
      tipoMotor: vehiculo.getTipoMotor(),
      clienteId: Number(vehiculo.getClienteId()),
      ultimoKilometraje: vehiculo.obtenerUltimoKilometraje() ?? 0,
    };

    await this.prisma.client$.vehicle.upsert({
      where: { placa: vehiculo.getPlaca().getValue() },
      update: data,
      create: {
        ...data,
        idMecanicoActivo: 0,
      },
    });
  }

  private toDomain(row: any): Vehiculo {
    return new Vehiculo(
      String(row.id),
      new Placa(row.placa),
      row.marca,
      row.modelo,
      row.anio,
      row.tipoMotor ?? 'GASOLINA',
      String(row.clienteId),
    );
  }
}

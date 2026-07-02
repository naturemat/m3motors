import { Injectable } from '@nestjs/common';
import { IVehiculoRepository } from '../../../domain/ports/repositories/IVehiculoRepository';
import { Vehiculo } from '../../../domain/aggregates/Vehiculo';
import { Placa } from '../../../domain/value-objects/Placa';

@Injectable()
export class InMemoryVehiculoRepository implements IVehiculoRepository {
  private readonly vehiculos: Map<string, Vehiculo> = new Map();

  async findById(id: string): Promise<Vehiculo | null> {
    return this.vehiculos.get(id) ?? null;
  }

  async findByPlaca(placa: Placa): Promise<Vehiculo | null> {
    for (const vehiculo of this.vehiculos.values()) {
      if (vehiculo.getPlaca().getValue() === placa.getValue()) {
        return vehiculo;
      }
    }
    return null;
  }

  async findAll(): Promise<Vehiculo[]> {
    return Array.from(this.vehiculos.values());
  }

  async save(vehiculo: Vehiculo): Promise<void> {
    this.vehiculos.set(vehiculo.getPlaca().getValue(), vehiculo);
  }
}

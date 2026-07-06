import { Injectable } from '@nestjs/common';
import { IVehiculoRepository } from '../../../domain/ports/repositories/IVehiculoRepository';
import { Vehiculo } from '../../../domain/aggregates/Vehiculo';
import { Placa } from '../../../domain/value-objects/Placa';

@Injectable()
export class InMemoryVehiculoRepository implements IVehiculoRepository {
  private readonly vehiculos: Map<string, Vehiculo> = new Map();

  findByPlaca(placa: Placa): Promise<Vehiculo | null> {
    for (const vehiculo of this.vehiculos.values()) {
      if (vehiculo.getPlaca().getValue() === placa.getValue()) {
        return Promise.resolve(vehiculo);
      }
    }
    return Promise.resolve(null);
  }

  findAll(): Promise<Vehiculo[]> {
    return Promise.resolve(Array.from(this.vehiculos.values()));
  }

  save(vehiculo: Vehiculo): Promise<void> {
    this.vehiculos.set(vehiculo.getPlaca().getValue(), vehiculo);
    return Promise.resolve();
  }
}

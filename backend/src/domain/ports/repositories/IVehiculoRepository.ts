import { Vehiculo } from '../../aggregates/Vehiculo';
import { Placa } from '../../value-objects/Placa';

export interface IVehiculoRepository {
  findById(id: string): Promise<Vehiculo | null>;
  findByPlaca(placa: Placa): Promise<Vehiculo | null>;
  findAll(): Promise<Vehiculo[]>;
  save(vehiculo: Vehiculo): Promise<void>;
}

import { Vehiculo } from '../../aggregates/Vehiculo';
import { Placa } from '../../value-objects/Placa';

export interface IVehiculoRepository {
  findByPlaca(placa: Placa): Promise<Vehiculo | null>;
  save(vehiculo: Vehiculo): Promise<void>;
}

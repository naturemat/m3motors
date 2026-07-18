import { Vehiculo } from '../../aggregates/Vehiculo';
import { Placa } from '../../../../shared/domain/value-objects/Placa';

export interface IVehiculoRepository {
  findByPlaca(placa: Placa): Promise<Vehiculo | null>;
  findByQrCode(codigo: string): Promise<Vehiculo | null>;
  findAll(): Promise<Vehiculo[]>;
  save(vehiculo: Vehiculo): Promise<void>;
}

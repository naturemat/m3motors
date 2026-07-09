import { TasaDesgaste } from '../value-objects/TasaDesgaste';
import { RegistroKilometraje } from '../../../registro-seguimiento/domain/value-objects/RegistroKilometraje';

export interface ServicioCalculoDesgaste {
  calcularTasaSemanal(registros: RegistroKilometraje[]): TasaDesgaste;
}

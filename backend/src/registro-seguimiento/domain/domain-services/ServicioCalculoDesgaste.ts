import { TasaDesgaste } from '../../../prediccion-analisis/domain/value-objects/TasaDesgaste';
import { RegistroKilometraje } from '../value-objects/RegistroKilometraje';

export interface ServicioCalculoDesgaste {
  calcularTasaSemanal(registros: RegistroKilometraje[]): TasaDesgaste;
}

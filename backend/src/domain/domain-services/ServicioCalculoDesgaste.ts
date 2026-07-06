import { RegistroKilometraje } from '../value-objects/RegistroKilometraje';
import { TasaDesgaste } from '../value-objects/TasaDesgaste';

export class ServicioCalculoDesgaste {
  public calcular(registros: RegistroKilometraje[]): TasaDesgaste {
    if (!registros || registros.length < 2) {
      return new TasaDesgaste(0);
    }

    const registrosOrdenados = [...registros].sort(
      (a, b) => a.getFecha().getTime() - b.getFecha().getTime(),
    );

    const primerRegistro = registrosOrdenados[0];
    const ultimoRegistro = registrosOrdenados[registrosOrdenados.length - 1];

    const kmRecorridos =
      ultimoRegistro.getValorKm() - primerRegistro.getValorKm();
    if (kmRecorridos < 0) {
      throw new Error(
        'El historial de kilometraje presenta inconsistencias cronológicas.',
      );
    }

    const milisegundosPorSemana = 1000 * 60 * 60 * 24 * 7;
    const tiempoSemanas =
      (ultimoRegistro.getFecha().getTime() -
        primerRegistro.getFecha().getTime()) /
      milisegundosPorSemana;

    const kmSemanales =
      tiempoSemanas > 0.1 ? kmRecorridos / tiempoSemanas : kmRecorridos;

    const KM_MAXIMOS_REFERENCIA = 1000;
    let porcentajeCalculado = (kmSemanales / KM_MAXIMOS_REFERENCIA) * 100;

    if (porcentajeCalculado > 100) porcentajeCalculado = 100;
    if (porcentajeCalculado < 0) porcentajeCalculado = 0;

    return new TasaDesgaste(porcentajeCalculado);
  }
}

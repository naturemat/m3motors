import { Injectable } from '@nestjs/common';
import { ServicioCalculoDesgaste } from '../domain/domain-services/ServicioCalculoDesgaste';
import { TasaDesgaste } from '../domain/value-objects/TasaDesgaste';
import { RegistroKilometraje } from '../../registro-seguimiento/domain/value-objects/RegistroKilometraje';

const MINIMO_REGISTROS = 3;
const DESVIACION_OUTLIER = 2;

@Injectable()
export class CalculoDesgasteService implements ServicioCalculoDesgaste {
  calcularTasaSemanal(registros: RegistroKilometraje[]): TasaDesgaste {
    if (registros.length < MINIMO_REGISTROS) {
      return new TasaDesgaste(0, new Date(), 'PROMEDIO_MOVIL_DISCRETO', 0);
    }

    const ordenados = [...registros].sort(
      (a, b) => a.getFecha().getTime() - b.getFecha().getTime(),
    );

    const puntos = ordenados.map((r) => ({
      km: r.getValorKm(),
      semanas: this.semanasEntre(ordenados[0].getFecha(), r.getFecha()),
    }));

    const filtrados = this.excluirOutliers(puntos);

    if (filtrados.length < MINIMO_REGISTROS) {
      return new TasaDesgaste(0, new Date(), 'PROMEDIO_MOVIL_DISCRETO', 0);
    }

    const tieneEspaciadoMinimo = this.verificarEspaciadoMinimo(ordenados);

    if (filtrados.length >= 5 && tieneEspaciadoMinimo) {
      const resultado = this.calcularRegresionLineal(filtrados);
      const confianza = this.calcularConfianza(
        filtrados,
        resultado.pendiente,
        resultado.intercepto,
      );
      return new TasaDesgaste(
        resultado.pendiente,
        new Date(),
        'REGRESION_LINEAL',
        confianza,
      );
    }

    const resultado = this.calcularPromedioMovil(filtrados);
    return new TasaDesgaste(
      resultado.kmPorSemana,
      new Date(),
      'PROMEDIO_MOVIL_DISCRETO',
      resultado.confianza,
    );
  }

  private semanasEntre(fechaInicio: Date, fechaFin: Date): number {
    const diffMs = fechaFin.getTime() - fechaInicio.getTime();
    return diffMs / (1000 * 60 * 60 * 24 * 7);
  }

  private excluirOutliers(
    puntos: { km: number; semanas: number }[],
  ): { km: number; semanas: number }[] {
    if (puntos.length < MINIMO_REGISTROS) return puntos;

    const pendientes: number[] = [];
    for (let i = 1; i < puntos.length; i++) {
      const deltaSemanas = puntos[i].semanas - puntos[i - 1].semanas;
      if (deltaSemanas > 0) {
        pendientes.push((puntos[i].km - puntos[i - 1].km) / deltaSemanas);
      }
    }

    if (pendientes.length === 0) return puntos;

    const media = pendientes.reduce((a, b) => a + b, 0) / pendientes.length;
    const varianza =
      pendientes.reduce((sum, p) => sum + Math.pow(p - media, 2), 0) /
      pendientes.length;
    const desviacion = Math.sqrt(varianza);

    if (desviacion === 0) return puntos;

    const kmPorSemana = puntos.map((p, i) => {
      if (i === 0) return media;
      const deltaS = p.semanas - puntos[i - 1].semanas;
      return deltaS > 0 ? (p.km - puntos[i - 1].km) / deltaS : media;
    });

    return puntos.filter((_, i) => {
      const desv = Math.abs(kmPorSemana[i] - media);
      return desv <= DESVIACION_OUTLIER * desviacion;
    });
  }

  private verificarEspaciadoMinimo(registros: RegistroKilometraje[]): boolean {
    for (let i = 1; i < registros.length; i++) {
      const semanas = this.semanasEntre(
        registros[i - 1].getFecha(),
        registros[i].getFecha(),
      );
      if (semanas < 1) return false;
    }
    return true;
  }

  private calcularRegresionLineal(puntos: { km: number; semanas: number }[]): {
    pendiente: number;
    intercepto: number;
  } {
    const n = puntos.length;
    const sumX = puntos.reduce((s, p) => s + p.semanas, 0);
    const sumY = puntos.reduce((s, p) => s + p.km, 0);
    const sumXY = puntos.reduce((s, p) => s + p.semanas * p.km, 0);
    const sumX2 = puntos.reduce((s, p) => s + p.semanas * p.semanas, 0);

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercepto = (sumY - pendiente * sumX) / n;

    return { pendiente: Math.max(0, pendiente), intercepto };
  }

  private calcularPromedioMovil(puntos: { km: number; semanas: number }[]): {
    kmPorSemana: number;
    confianza: number;
  } {
    const primero = puntos[0];
    const ultimo = puntos[puntos.length - 1];
    const deltaSemanas = ultimo.semanas - primero.semanas;

    if (deltaSemanas <= 0) {
      return { kmPorSemana: 0, confianza: 0 };
    }

    const kmPorSemana = (ultimo.km - primero.km) / deltaSemanas;
    const confianza = Math.min(1, puntos.length / 6);

    return { kmPorSemana: Math.max(0, kmPorSemana), confianza };
  }

  private calcularConfianza(
    puntos: { km: number; semanas: number }[],
    pendiente: number,
    intercepto: number,
  ): number {
    if (puntos.length < 2) return 0;

    const n = puntos.length;
    const mediaY = puntos.reduce((s, p) => s + p.km, 0) / n;

    const ssTot = puntos.reduce((s, p) => s + Math.pow(p.km - mediaY, 2), 0);
    const ssRes = puntos.reduce(
      (s, p) => s + Math.pow(p.km - (pendiente * p.semanas + intercepto), 2),
      0,
    );

    if (ssTot === 0) return 1;

    const r2 = 1 - ssRes / ssTot;
    const penalizacionMuestras = Math.min(1, n / 6);

    return Math.max(0, Math.min(1, r2 * penalizacionMuestras));
  }
}

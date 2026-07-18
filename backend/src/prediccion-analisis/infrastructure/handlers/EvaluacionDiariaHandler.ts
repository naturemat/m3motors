/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { GenerarPrediccion } from '../../application/use-cases/GenerarPrediccion';

@Injectable()
export class EvaluacionDiariaHandler {
  private readonly logger = new Logger(EvaluacionDiariaHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generarPrediccion: GenerarPrediccion,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async ejecutar(): Promise<void> {
    this.logger.log('=== Iniciando evaluación diaria de componentes ===');

    const vehiculos = await this.prisma.client$.vehicle.findMany({
      where: {
        status: 'ACTIVE',
        tasaDesgasteKmSem: { gt: 0 },
      },
      include: {
        cliente: { select: { id: true } },
        intervenciones: {
          where: { estado: 'FINALIZADO' },
          orderBy: { fecha: 'desc' },
          take: 1,
          include: {
            detalles: {
              select: {
                componenteReemplazado: true,
                kilometrajeInstalacion: true,
                limiteKilometraje: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Vehículos a evaluar: ${vehiculos.length}`);

    for (const vehiculo of vehiculos) {
      try {
        await this.evaluarVehiculo(vehiculo);
      } catch (error) {
        this.logger.error(
          `Error evaluando vehículo ${vehiculo.id}: ${String(error)}`,
        );
      }
    }

    this.logger.log('=== Evaluación diaria completada ===');
  }

  private async evaluarVehiculo(vehiculo: any): Promise<void> {
    const ultimaIntervencion = vehiculo.intervenciones[0];
    if (!ultimaIntervencion) return;

    const kmPorSemana = vehiculo.tasaDesgasteKmSem;
    const kmActual = this.calcularKmEstimado(
      vehiculo.ultimoKilometraje,
      kmPorSemana,
      ultimaIntervencion.fecha,
    );

    const componentes = ultimaIntervencion.detalles.map((d: any) => ({
      nombre: d.componenteReemplazado,
      kilometrajeInstalacion: d.kilometrajeInstalacion,
      limiteKilometraje: d.limiteKilometraje,
    }));

    if (componentes.length === 0) return;

    await this.generarPrediccion.execute({
      vehicleId: String(vehiculo.id),
      placa: vehiculo.placa,
      clienteId: String(vehiculo.cliente?.id ?? 0),
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      anio: vehiculo.anio,
      kilometrajeActual: kmActual,
      kmPorSemana,
      componentesCriticos: componentes,
    });
  }

  private calcularKmEstimado(
    ultimoKm: number,
    kmPorSemana: number,
    fechaUltimaIntervencion: Date,
  ): number {
    const ahora = new Date();
    const diffMs =
      ahora.getTime() - new Date(fechaUltimaIntervencion).getTime();
    const semanasTranscurridas = diffMs / (1000 * 60 * 60 * 24 * 7);
    return Math.round(ultimoKm + kmPorSemana * semanasTranscurridas);
  }
}

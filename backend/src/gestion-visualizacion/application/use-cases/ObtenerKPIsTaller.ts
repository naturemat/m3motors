/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { KPIsTaller } from '../../domain/entities/KPIsTaller';

@Injectable()
export class ObtenerKPIsTaller {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(workshopId: number): Promise<KPIsTaller> {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalVehiculos,
      totalClientesActivos,
      ingresosMes,
      ingresosTotales,
      totalServicios,
      totalMecanicos,
      totalAlertasActivas,
      intervencionesMes,
      totalOrders,
      calificacionPromedio,
    ] = await Promise.all([
      this.prisma.client$.vehicle.count({
        where: { mecanicoActivo: { workshopId } },
      }),
      this.prisma.client$.cliente.count({
        where: {
          mecanicoActivo: { workshopId },
          status: 'ACTIVATED',
        },
      }),
      this.prisma.client$.intervention.aggregate({
        _sum: { manoDeObra: true },
        where: {
          mecanico: { workshopId },
          fecha: { gte: inicioMes },
        },
      }),
      this.prisma.client$.intervention.aggregate({
        _sum: { manoDeObra: true },
        where: {
          mecanico: { workshopId },
        },
      }),
      this.prisma.client$.serviceCatalog.count({
        where: { workshopId, activo: true },
      }),
      this.prisma.client$.mechanic.count({
        where: { workshopId, activo: true },
      }),
      this.prisma.client$.alertaPredictiva.count({
        where: {
          vehiculo: { mecanicoActivo: { workshopId } },
          estadoAlerta: { in: ['activa', 'pendiente', 'ACTIVA', 'PENDIENTE'] },
        },
      }),
      this.prisma.client$.intervention.count({
        where: {
          mecanico: { workshopId },
          fecha: { gte: inicioMes },
        },
      }),
      this.prisma.client$.intervention.count({
        where: {
          mecanico: { workshopId },
        },
      }),
      this.prisma.client$.mechanic.aggregate({
        _avg: { rating: true },
        where: { workshopId, activo: true },
      }),
    ]);

    return {
      totalVehiculos,
      totalClientesActivos,
      ingresosMes: Number(ingresosMes._sum.manoDeObra ?? 0),
      ingresosTotales: Number(ingresosTotales._sum.manoDeObra ?? 0),
      calificacionPromedio: Math.round(calificacionPromedio._avg.rating ?? 0),
      totalServicios,
      totalMecanicos,
      totalAlertasActivas,
      intervencionesMes,
      totalOrders,
    };
  }
}

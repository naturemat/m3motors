/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { KPIsMecanico } from '../../domain/entities/KPIsTaller';

@Injectable()
export class ObtenerKPIsMecanico {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(clerkId: string): Promise<KPIsMecanico> {
    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId },
    });

    if (!mechanic) {
      return {
        totalIntervenciones: 0,
        intervencionesMes: 0,
        vehiculosAtendidos: 0,
        clientesAtendidos: 0,
        ingresosGenerados: 0,
        alertasAsignadas: 0,
      };
    }

    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalIntervenciones,
      intervencionesMes,
      vehiculosAtendidos,
      clientesAtendidos,
      ingresosGenerados,
      alertasAsignadas,
    ] = await Promise.all([
      this.prisma.client$.intervention.count({
        where: { mecanicoId: mechanic.id },
      }),
      this.prisma.client$.intervention.count({
        where: {
          mecanicoId: mechanic.id,
          fecha: { gte: inicioMes },
        },
      }),
      this.prisma.client$.vehicle
        .findMany({
          where: { idMecanicoActivo: mechanic.id },
          distinct: ['id'],
        })
        .then((v) => v.length),
      this.prisma.client$.cliente
        .findMany({
          where: { idMecanicoActivo: mechanic.id },
          distinct: ['id'],
        })
        .then((c) => c.length),
      this.prisma.client$.intervention.aggregate({
        _sum: { manoDeObra: true },
        where: { mecanicoId: mechanic.id },
      }),
      this.prisma.client$.alertaPredictiva.count({
        where: {
          vehiculo: { idMecanicoActivo: mechanic.id },
          estadoAlerta: { in: ['ACTIVA', 'PENDIENTE', 'activa', 'pendiente'] },
        },
      }),
    ]);

    return {
      totalIntervenciones,
      intervencionesMes,
      vehiculosAtendidos,
      clientesAtendidos,
      ingresosGenerados: Number(ingresosGenerados._sum.manoDeObra ?? 0),
      alertasAsignadas,
    };
  }
}

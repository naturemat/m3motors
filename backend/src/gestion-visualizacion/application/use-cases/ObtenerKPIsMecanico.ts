/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { KPIsMecanico } from '../../domain/entities/KPIsTaller';

@Injectable()
export class ObtenerKPIsMecanico {
  private readonly logger = new Logger(ObtenerKPIsMecanico.name);

  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(clerkId: string): Promise<KPIsMecanico> {
    const isDebug = process.env.LOG_LEVEL === 'debug';

    if (isDebug)
      this.logger.log(`[KPI-Mec] Buscando mecánico con clerkId="${clerkId}"`);

    const mechanic = await this.prisma.client$.mechanic.findFirst({
      where: { clerkId },
    });

    if (!mechanic) {
      if (isDebug)
        this.logger.warn(`[KPI-Mec] Mecánico NO encontrado → retornando zeros`);
      return {
        totalIntervenciones: 0,
        intervencionesMes: 0,
        vehiculosAtendidos: 0,
        clientesAtendidos: 0,
        ingresosGenerados: 0,
        alertasAsignadas: 0,
      };
    }

    if (isDebug)
      this.logger.log(
        `[KPI-Mec] Mecánico encontrado: id=${mechanic.id}, workshopId=${mechanic.workshopId}`,
      );

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

    if (isDebug) {
      this.logger.log(
        `[KPI-Mec] intervention.count(total): ${totalIntervenciones}`,
      );
      this.logger.log(
        `[KPI-Mec] intervention.count(mes): ${intervencionesMes}`,
      );
      this.logger.log(`[KPI-Mec] vehicle.distinct: ${vehiculosAtendidos}`);
      this.logger.log(`[KPI-Mec] cliente.distinct: ${clientesAtendidos}`);
      this.logger.log(
        `[KPI-Mec] intervention.aggregate(manoDeObra): ${Number(ingresosGenerados._sum.manoDeObra ?? 0)}`,
      );
      this.logger.log(`[KPI-Mec] alertaPredictiva.count: ${alertasAsignadas}`);
    }

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

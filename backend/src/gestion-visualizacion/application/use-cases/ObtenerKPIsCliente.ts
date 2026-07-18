/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { KPIsCliente } from '../../domain/entities/KPIsTaller';

@Injectable()
export class ObtenerKPIsCliente {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(clerkId: string): Promise<KPIsCliente> {
    const cliente = await this.prisma.client$.cliente.findFirst({
      where: { clerkId },
    });

    if (!cliente) {
      return {
        totalVehiculos: 0,
        totalIntervenciones: 0,
        proximoMantenimiento: null,
        kilometrajeActual: 0,
        alertasActivas: 0,
        historialReciente: [],
      };
    }

    const vehiculos = await this.prisma.client$.vehicle.findMany({
      where: { clienteId: cliente.id },
      include: {
        intervenciones: {
          orderBy: { fecha: 'desc' },
          take: 5,
          include: { mecanico: true },
        },
        alertas: {
          where: { estadoAlerta: { in: ['ACTIVA', 'PENDIENTE', 'activa', 'pendiente'] } },
        },
      },
    });

    // Count ALL interventions across all vehicles (not limited to 5 per vehicle)
    const totalIntervenciones = await this.prisma.client$.intervention.count({
      where: { vehiculo: { clienteId: cliente.id } },
    });

    const totalVehiculos = vehiculos.length;
    const kilometrajeActual = vehiculos.reduce(
      (max, v) => Math.max(max, v.ultimoKilometraje),
      0,
    );
    const alertasActivas = vehiculos.reduce(
      (sum, v) => sum + v.alertas.length,
      0,
    );

    // Find next maintenance from alerts
    let proximoMantenimiento: string | null = null;
    for (const v of vehiculos) {
      for (const alerta of v.alertas) {
        const isActiva = alerta.estadoAlerta === 'ACTIVA' || alerta.estadoAlerta === 'activa';
        if (
          isActiva &&
          (!proximoMantenimiento ||
            alerta.fechaEstimada < new Date(proximoMantenimiento))
        ) {
          proximoMantenimiento = alerta.fechaEstimada.toISOString();
        }
      }
    }

    // Build recent history
    const historialReciente = vehiculos
      .flatMap((v) =>
        v.intervenciones.map((i) => ({
          fecha: i.fecha.toISOString(),
          servicio: i.diagnostico ?? 'Servicio',
          mecanico: i.mecanico?.nombre ?? 'N/A',
        })),
      )
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);

    return {
      totalVehiculos,
      totalIntervenciones,
      proximoMantenimiento,
      kilometrajeActual,
      alertasActivas,
      historialReciente,
    };
  }
}

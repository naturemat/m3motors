/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { KPIsCliente } from '../../domain/entities/KPIsTaller';

@Injectable()
export class ObtenerKPIsCliente {
  private readonly logger = new Logger(ObtenerKPIsCliente.name);

  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(clerkId: string): Promise<KPIsCliente> {
    const isDebug = process.env.LOG_LEVEL === 'debug';

    if (isDebug) this.logger.log(`[KPI-Cliente] Buscando cliente con clerkId="${clerkId}"`);

    const cliente = await this.prisma.client$.cliente.findFirst({
      where: { clerkId },
    });

    if (!cliente) {
      if (isDebug) this.logger.warn(`[KPI-Cliente] Cliente NO encontrado → retornando zeros`);
      return {
        totalVehiculos: 0,
        totalIntervenciones: 0,
        proximoMantenimiento: null,
        kilometrajeActual: 0,
        alertasActivas: 0,
        historialReciente: [],
      };
    }

    if (isDebug) this.logger.log(`[KPI-Cliente] Cliente encontrado: id=${cliente.id}, email="${cliente.email}"`);

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

    if (isDebug) this.logger.log(`[KPI-Cliente] Vehículos encontrados: ${vehiculos.length}`);

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

    if (isDebug) {
      this.logger.log(`[KPI-Cliente] totalVehiculos: ${totalVehiculos}`);
      this.logger.log(`[KPI-Cliente] totalIntervenciones: ${totalIntervenciones}`);
      this.logger.log(`[KPI-Cliente] kilometrajeActual: ${kilometrajeActual}`);
      this.logger.log(`[KPI-Cliente] alertasActivas: ${alertasActivas}`);
      this.logger.log(`[KPI-Cliente] historialReciente: ${historialReciente.length} items`);
    }

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

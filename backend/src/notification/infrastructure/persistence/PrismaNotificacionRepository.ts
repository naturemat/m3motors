/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { Notificacion } from '../../domain/entities/Notificacion';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import { EstadoNotificacion } from '../../domain/value-objects/EstadoNotificacion';
import { CanalEnvio } from '../../domain/value-objects/CanalEnvio';
import { TipoNotificacion } from '../../domain/value-objects/TipoNotificacion';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrismaNotificacionRepository implements INotificationRepository {
  private readonly logger = new Logger(PrismaNotificacionRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  private get notificacion() {
    return this.prisma.client$.notificacion;
  }

  async save(notificacion: Notificacion): Promise<Notificacion> {
    const data = notificacion.toProps();
    const id = data.id || uuidv4();

    const created = await this.notificacion.create({
      data: {
        id,
        id_cliente: data.clienteId ? parseInt(data.clienteId) : null,
        id_vehiculo: data.vehicleId ? parseInt(data.vehicleId) : null,
        tipo_notificacion: data.tipo,
        canal: data.canal,
        asunto: data.asunto,
        contenido: data.contenido,
        email_destino: data.emailDestino,
        estado: data.estado,
        entregado: data.entregado,
        fallo_motivo: data.falloMotivo,
        intentos: data.intentos,
        max_intentos: data.maxIntentos,
        enviado_en: data.enviadoEn,
        proximo_intento_en: data.proximoIntentoEn,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Notificacion | null> {
    const found = await this.notificacion.findUnique({
      where: { id },
    });

    return found ? this.toDomain(found) : null;
  }

  async findByClienteId(clienteId: string): Promise<Notificacion[]> {
    const found = await this.notificacion.findMany({
      where: { id_cliente: parseInt(clienteId) },
      orderBy: { created_at: 'desc' },
    });

    return found.map((n: any) => this.toDomain(n));
  }

  async findPendientes(): Promise<Notificacion[]> {
    const found = await this.notificacion.findMany({
      where: { estado: EstadoNotificacion.PENDIENTE },
      orderBy: { created_at: 'asc' },
    });

    return found.map((n: any) => this.toDomain(n));
  }

  async findFallidasParaReintentar(): Promise<Notificacion[]> {
    const now = new Date();
    const found = await this.notificacion.findMany({
      where: {
        estado: EstadoNotificacion.FALLIDA,
        intentos: { lt: 3 },
        OR: [
          { proximo_intento_en: null },
          { proximo_intento_en: { lte: now } },
        ],
      },
      orderBy: { created_at: 'asc' },
    });

    return found.map((n: any) => this.toDomain(n));
  }

  async update(notificacion: Notificacion): Promise<void> {
    const data = notificacion.toProps();
    if (!data.id) {
      throw new Error('No se puede actualizar una notificacion sin id');
    }
    await this.notificacion.update({
      where: { id: data.id },
      data: {
        estado: data.estado,
        entregado: data.entregado,
        fallo_motivo: data.falloMotivo,
        intentos: data.intentos,
        enviado_en: data.enviadoEn,
        proximo_intento_en: data.proximoIntentoEn,
      },
    });
  }

  countByClienteAndTipo(clienteId: string, tipo: string): Promise<number> {
    return this.notificacion.count({
      where: {
        id_cliente: parseInt(clienteId),
        tipo_notificacion: tipo,
      },
    });
  }

  private toDomain(record: {
    id: string;
    id_cliente: number | null;
    id_vehiculo: number | null;
    tipo_notificacion: string;
    canal: string;
    asunto: string | null;
    contenido: string;
    email_destino: string | null;
    estado: string | null;
    entregado: boolean | null;
    fallo_motivo: string | null;
    intentos: number | null;
    max_intentos: number | null;
    enviado_en: Date | null;
    proximo_intento_en: Date | null;
    metadata: unknown;
    created_at: Date | null;
    updated_at: Date | null;
  }): Notificacion {
    return new Notificacion({
      id: record.id,
      clienteId: record.id_cliente?.toString() ?? '',
      vehicleId: record.id_vehiculo?.toString() ?? undefined,
      tipo: record.tipo_notificacion as TipoNotificacion,
      canal: record.canal as CanalEnvio,
      asunto: record.asunto ?? '',
      contenido: record.contenido,
      emailDestino: record.email_destino ?? undefined,
      estado:
        (record.estado as EstadoNotificacion) ?? EstadoNotificacion.PENDIENTE,
      entregado: record.entregado ?? false,
      falloMotivo: record.fallo_motivo ?? undefined,
      intentos: record.intentos ?? 0,
      maxIntentos: record.max_intentos ?? 3,
      enviadoEn: record.enviado_en ?? undefined,
      proximoIntentoEn: record.proximo_intento_en ?? undefined,
      metadata: record.metadata
        ? typeof record.metadata === 'string'
          ? JSON.parse(record.metadata)
          : (record.metadata as Record<string, unknown>)
        : undefined,
      createdAt: record.created_at ?? new Date(),
      updatedAt: record.updated_at ?? new Date(),
    });
  }
}

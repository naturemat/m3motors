/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { IIntervencionRepository } from '../../../domain/ports/repositories/IIntervencionRepository';
import { Intervencion } from '../../../domain/entities/Intervencion';
import { IntervencionId } from '../../../domain/value-objects/IntervencionId';
import { DiagnosticoTecnico } from '../../../domain/value-objects/DiagnosticoTecnico';
import { MecanicoId } from '../../../domain/value-objects/MecanicoId';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaIntervencionRepository implements IIntervencionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: IntervencionId): Promise<Intervencion | null> {
    const row = await this.prisma.client$.intervention.findUnique({
      where: { id: Number(id.getValue()) },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Intervencion[]> {
    const rows = await this.prisma.client$.intervention.findMany();
    return rows.map((row: any) => this.toDomain(row));
  }

  async save(intervencion: Intervencion): Promise<void> {
    const data = {
      vehiculoId: 0,
      mecanicoId: Number(intervencion.getMecanicoId().getValue()),
      fecha: intervencion.getFecha(),
      diagnostico: intervencion.getDiagnostico().getFallaDetectada(),
      severidad: intervencion.getDiagnostico().getNivelSeveridad(),
      manoDeObra: intervencion.getManoDeObra(),
      estado: intervencion.getEstado(),
    };

    await this.prisma.client$.intervention.upsert({
      where: { id: Number(intervencion.getId().getValue()) },
      update: data,
      create: data,
    });
  }

  private toDomain(row: any): Intervencion {
    const diagnostico = new DiagnosticoTecnico(
      row.diagnostico ?? 'Sin diagnostico',
      (row.severidad as 'BAJA' | 'MEDIA' | 'ALTA') ?? 'BAJA',
      row.observaciones ?? '',
    );

    return new Intervencion(
      new IntervencionId(String(row.id)),
      row.fecha ?? new Date(),
      diagnostico,
      Number(row.manoDeObra ?? 0),
      new MecanicoId(String(row.mecanicoId)),
    );
  }
}

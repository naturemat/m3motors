import { Injectable } from '@nestjs/common';
import { IIntervencionRepository } from '../../../domain/ports/repositories/IIntervencionRepository';
import { Intervencion } from '../../../domain/entities/Intervencion';
import { IntervencionId } from '../../../domain/value-objects/IntervencionId';

@Injectable()
export class InMemoryIntervencionRepository implements IIntervencionRepository {
  private readonly intervenciones: Map<string, Intervencion> = new Map();

  async findById(id: IntervencionId): Promise<Intervencion | null> {
    return this.intervenciones.get(id.getValue()) ?? null;
  }

  async findAll(): Promise<Intervencion[]> {
    return Array.from(this.intervenciones.values());
  }

  async save(intervencion: Intervencion): Promise<void> {
    this.intervenciones.set(intervencion.getId().getValue(), intervencion);
  }
}

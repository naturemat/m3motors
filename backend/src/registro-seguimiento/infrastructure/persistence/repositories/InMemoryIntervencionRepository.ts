import { Injectable } from '@nestjs/common';
import { IIntervencionRepository } from '../../../domain/ports/repositories/IIntervencionRepository';
import { Intervencion } from '../../../domain/entities/Intervencion';
import { IntervencionId } from '../../../domain/value-objects/IntervencionId';

@Injectable()
export class InMemoryIntervencionRepository implements IIntervencionRepository {
  private readonly intervenciones: Map<string, Intervencion> = new Map();

  findById(id: IntervencionId): Promise<Intervencion | null> {
    return Promise.resolve(this.intervenciones.get(id.getValue()) ?? null);
  }

  findAll(): Promise<Intervencion[]> {
    return Promise.resolve(Array.from(this.intervenciones.values()));
  }

  save(intervencion: Intervencion): Promise<void> {
    this.intervenciones.set(intervencion.getId().getValue(), intervencion);
    return Promise.resolve();
  }
}

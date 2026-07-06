import { Intervencion } from '../../entities/Intervencion';
import { IntervencionId } from '../../value-objects/IntervencionId';

export interface IIntervencionRepository {
  findById(id: IntervencionId): Promise<Intervencion | null>;
  findAll(): Promise<Intervencion[]>;
  save(intervencion: Intervencion): Promise<void>;
}

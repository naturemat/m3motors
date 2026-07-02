import { IntervencionId } from '../value-objects/IntervencionId';
import { DiagnosticoTecnico } from '../value-objects/DiagnosticoTecnico';
import { ComponenteCritico } from '../value-objects/ComponenteCritico';
import { MecanicoId } from '../value-objects/MecanicoId';

export class Intervencion {
  private estado: 'PENDIENTE' | 'FINALIZADO';
  private componentesSustituidos: ComponenteCritico[];

  constructor(
    private readonly id: IntervencionId,
    private readonly fecha: Date,
    private readonly diagnostico: DiagnosticoTecnico,
    private readonly manoDeObra: number,
    private readonly mecanicoId: MecanicoId
  ) {
    if (manoDeObra < 0) throw new Error('La mano de obra no puede ser negativa');
    this.estado = 'PENDIENTE';
    this.componentesSustituidos = [];
  }

  registrarSustitucionComponente(componente: ComponenteCritico): void {
    if (this.estado === 'FINALIZADO') {
      throw new Error('No se pueden agregar componentes a una intervención finalizada');
    }
    this.componentesSustituidos.push(componente);
  }

  finalizarIntervencion(): void {
    if (this.estado === 'FINALIZADO') {
      throw new Error('La intervención ya está finalizada');
    }
    this.estado = 'FINALIZADO';
  }

  getId(): IntervencionId { return this.id; }
  getFecha(): Date { return this.fecha; }
  getDiagnostico(): DiagnosticoTecnico { return this.diagnostico; }
  getManoDeObra(): number { return this.manoDeObra; }
  getMecanicoId(): MecanicoId { return this.mecanicoId; }
  getEstado(): string { return this.estado; }
  getComponentesSustituidos(): ReadonlyArray<ComponenteCritico> { return Object.freeze([...this.componentesSustituidos]); }
}
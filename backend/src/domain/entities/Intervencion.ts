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
    this.validarManoDeObra();
    this.estado = 'PENDIENTE';
    this.componentesSustituidos = [];
  }

  registrarSustitucionComponente(componente: ComponenteCritico): void {
    this.validarNoFinalizada();
    this.componentesSustituidos.push(componente);
  }

  finalizarIntervencion(): void {
    this.validarNoFinalizada();
    this.estado = 'FINALIZADO';
  }

  getId(): IntervencionId { return this.id; }
  getFecha(): Date { return this.fecha; }
  getDiagnostico(): DiagnosticoTecnico { return this.diagnostico; }
  getManoDeObra(): number { return this.manoDeObra; }
  getMecanicoId(): MecanicoId { return this.mecanicoId; }
  getEstado(): string { return this.estado; }
  getComponentesSustituidos(): ReadonlyArray<ComponenteCritico> { return Object.freeze([...this.componentesSustituidos]); }

  private validarManoDeObra(): void {
    if (this.manoDeObra < 0) {
      throw new Error('La mano de obra no puede ser negativa');
    }
  }

  private validarNoFinalizada(): void {
    if (this.estado === 'FINALIZADO') {
      throw new Error('La operación no está permitida en una intervención finalizada');
    }
  }
}
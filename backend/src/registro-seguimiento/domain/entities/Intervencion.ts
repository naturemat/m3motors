import { IntervencionId } from '../value-objects/IntervencionId';
import { DiagnosticoTecnico } from '../value-objects/DiagnosticoTecnico';
import { ComponenteCritico } from '../value-objects/ComponenteCritico';
import { MecanicoId } from '../value-objects/MecanicoId';

export class Intervencion {
  private estado: 'PENDIENTE' | 'FINALIZADO';
  private componentesSustituidos: ComponenteCritico[];
  private serviciosRealizados: number[];

  constructor(
    private readonly id: IntervencionId,
    private readonly fecha: Date,
    private readonly diagnostico: DiagnosticoTecnico,
    private readonly manoDeObra: number,
    private readonly mecanicoId: MecanicoId,
  ) {
    this.validarFecha(fecha);
    this.validarManoDeObra(manoDeObra);
    this.estado = 'PENDIENTE';
    this.componentesSustituidos = [];
    this.serviciosRealizados = [];
  }

  registrarSustitucionComponente(componente: ComponenteCritico): void {
    this.validarNoFinalizada();
    this.componentesSustituidos.push(componente);
  }

  agregarServicio(servicioId: number): void {
    this.validarNoFinalizada();
    if (this.serviciosRealizados.includes(servicioId)) {
      throw new Error('El servicio ya está registrado en esta intervención');
    }
    this.serviciosRealizados.push(servicioId);
  }

  calcularCostoTotal(): number {
    return this.manoDeObra;
  }

  finalizarIntervencion(): void {
    this.validarNoFinalizada();
    this.estado = 'FINALIZADO';
  }

  getId(): IntervencionId {
    return this.id;
  }

  getFecha(): Date {
    return this.fecha;
  }

  getDiagnostico(): DiagnosticoTecnico {
    return this.diagnostico;
  }

  getManoDeObra(): number {
    return this.manoDeObra;
  }

  getMecanicoId(): MecanicoId {
    return this.mecanicoId;
  }

  getEstado(): 'PENDIENTE' | 'FINALIZADO' {
    return this.estado;
  }

  getComponentesSustituidos(): ReadonlyArray<ComponenteCritico> {
    return Object.freeze([...this.componentesSustituidos]);
  }

  getServiciosRealizados(): ReadonlyArray<number> {
    return Object.freeze([...this.serviciosRealizados]);
  }

  private validarFecha(fecha: Date): void {
    if (fecha > new Date()) {
      throw new Error('La fecha de la intervención no puede ser futura');
    }
  }

  private validarManoDeObra(manoDeObra: number): void {
    if (manoDeObra < 0) {
      throw new Error('La mano de obra no puede ser negativa');
    }
  }

  private validarNoFinalizada(): void {
    if (this.estado === 'FINALIZADO') {
      throw new Error(
        'La operación no está permitida en una intervención finalizada',
      );
    }
  }
}

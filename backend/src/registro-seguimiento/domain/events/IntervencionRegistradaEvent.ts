import { DomainEventBase } from '../../../shared/domain/events/DomainEventBase';

export type NivelSeveridad = 'BAJA' | 'MEDIA' | 'ALTA';

export interface ComponenteSustituidoInfo {
  readonly componenteId: string;
  readonly nombre: string;
  readonly kilometrajeInstalacion: number;
  readonly limiteKilometrajeFabricante: number;
}

export interface DiagnosticoInfo {
  readonly fallaDetectada: string;
  readonly observacionesMecanico: string;
  readonly nivelSeveridad: NivelSeveridad;
}

export interface IntervencionRegistradaPayload extends DomainEventBase {
  readonly eventName: 'intervencion.registrada';
  readonly intervencionId: string;
  readonly vehicleId: string;
  readonly placa: string;
  readonly mecanicoId: string;
  readonly workshopId: string;
  readonly diagnostico: DiagnosticoInfo;
  readonly componentesSustituidos: ReadonlyArray<ComponenteSustituidoInfo>;
  readonly manoDeObra: number;
}

export class IntervencionRegistradaEvent {
  static readonly EVENT_NAME = 'intervencion.registrada' as const;

  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly intervencionId: string;
  public readonly vehicleId: string;
  public readonly placa: string;
  public readonly mecanicoId: string;
  public readonly workshopId: string;
  public readonly diagnostico: DiagnosticoInfo;
  public readonly componentesSustituidos: ReadonlyArray<ComponenteSustituidoInfo>;
  public readonly manoDeObra: number;

  constructor(params: {
    intervencionId: string;
    vehicleId: string;
    placa: string;
    mecanicoId: string;
    workshopId: string;
    diagnostico: DiagnosticoInfo;
    componentesSustituidos: ComponenteSustituidoInfo[];
    manoDeObra: number;
  }) {
    this.eventId = crypto.randomUUID();
    this.occurredOn = new Date();
    this.intervencionId = params.intervencionId;
    this.vehicleId = params.vehicleId;
    this.placa = params.placa;
    this.mecanicoId = params.mecanicoId;
    this.workshopId = params.workshopId;
    this.diagnostico = Object.freeze({ ...params.diagnostico });
    this.componentesSustituidos = Object.freeze([
      ...params.componentesSustituidos,
    ]);
    this.manoDeObra = params.manoDeObra;
    Object.freeze(this);
  }

  toPayload(): IntervencionRegistradaPayload {
    return {
      eventId: this.eventId,
      occurredOn: this.occurredOn,
      eventName: IntervencionRegistradaEvent.EVENT_NAME,
      intervencionId: this.intervencionId,
      vehicleId: this.vehicleId,
      placa: this.placa,
      mecanicoId: this.mecanicoId,
      workshopId: this.workshopId,
      diagnostico: this.diagnostico,
      componentesSustituidos: this.componentesSustituidos,
      manoDeObra: this.manoDeObra,
    };
  }
}

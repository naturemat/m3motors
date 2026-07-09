import { Inject } from '@nestjs/common';
import { Intervencion } from '../../domain/entities/Intervencion';
import { IntervencionId } from '../../domain/value-objects/IntervencionId';
import { DiagnosticoTecnico } from '../../domain/value-objects/DiagnosticoTecnico';
import { ComponenteCritico } from '../../domain/value-objects/ComponenteCritico';
import { MecanicoId } from '../../domain/value-objects/MecanicoId';
import { Placa } from '../../../shared/domain/value-objects/Placa';
import { IVehiculoRepository } from '../../domain/ports/repositories/IVehiculoRepository';
import {
  IDomainEventPublisher,
  IDOMAIN_EVENT_PUBLISHER,
} from '../../../shared/domain/ports/events/IDomainEventPublisher';
import { IntervencionRegistradaEvent } from '../../domain/events/IntervencionRegistradaEvent';
import { RegistrarIntervencionDTO } from '../dto/RegistrarIntervencionDTO';

export class RegistrarIntervencion {
  constructor(
    private readonly vehiculoRepository: IVehiculoRepository,
    @Inject(IDOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: IDomainEventPublisher,
  ) {}

  async execute(dto: RegistrarIntervencionDTO): Promise<void> {
    const placa = new Placa(dto.placa);

    const vehiculo = await this.vehiculoRepository.findByPlaca(placa);
    if (!vehiculo) {
      throw new Error(`Vehículo con placa ${dto.placa} no encontrado.`);
    }

    const intervencion = this.construirIntervencion(dto);
    this.agregarComponentes(intervencion, dto);

    vehiculo.vincularNuevaIntervencion(intervencion);
    vehiculo.registrarIngresoKilometraje(dto.kilometrajeActual, dto.fecha);

    await this.vehiculoRepository.save(vehiculo);
    await this.publicarEvento(intervencion, dto, vehiculo.getId());
  }

  private construirIntervencion(dto: RegistrarIntervencionDTO): Intervencion {
    const intervencionId = new IntervencionId(crypto.randomUUID());
    const diagnostico = new DiagnosticoTecnico(
      dto.diagnostico,
      dto.nivelSeveridad,
      dto.observacionesMecanico,
    );
    const mecanicoId = new MecanicoId(dto.mecanicoId);

    return new Intervencion(
      intervencionId,
      dto.fecha,
      diagnostico,
      dto.manoDeObra,
      mecanicoId,
    );
  }

  private agregarComponentes(
    intervencion: Intervencion,
    dto: RegistrarIntervencionDTO,
  ): void {
    for (const comp of dto.componentes) {
      intervencion.registrarSustitucionComponente(
        new ComponenteCritico(
          crypto.randomUUID(),
          comp.nombre,
          0,
          comp.limiteKilometrajeFabricante,
        ),
      );
    }
  }

  private async publicarEvento(
    intervencion: Intervencion,
    dto: RegistrarIntervencionDTO,
    vehicleId: string,
  ): Promise<void> {
    const evento = new IntervencionRegistradaEvent({
      intervencionId: intervencion.getId().getValue(),
      vehicleId,
      placa: dto.placa,
      mecanicoId: dto.mecanicoId,
      workshopId: dto.workshopId,
      diagnostico: {
        fallaDetectada: dto.diagnostico,
        observacionesMecanico: dto.observacionesMecanico,
        nivelSeveridad: dto.nivelSeveridad,
      },
      componentesSustituidos: dto.componentes.map((c) => ({
        componenteId: crypto.randomUUID(),
        nombre: c.nombre,
        kilometrajeInstalacion: 0,
        limiteKilometrajeFabricante: c.limiteKilometrajeFabricante,
      })),
      manoDeObra: dto.manoDeObra,
    });

    await this.eventPublisher.publish(
      IntervencionRegistradaEvent.EVENT_NAME,
      evento.toPayload(),
    );
  }
}

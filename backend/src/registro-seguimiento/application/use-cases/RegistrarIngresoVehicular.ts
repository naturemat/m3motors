import { Inject } from '@nestjs/common';
import { Vehiculo } from '../../domain/aggregates/Vehiculo';
import { Placa } from '../../../shared/domain/value-objects/Placa';
import { IVehiculoRepository } from '../../domain/ports/repositories/IVehiculoRepository';
import {
  IDomainEventPublisher,
  IDOMAIN_EVENT_PUBLISHER,
} from '../../../shared/domain/ports/events/IDomainEventPublisher';
import { KilometrajeActualizadoEvent } from '../../domain/events/KilometrajeActualizadoEvent';
import { RegistrarIngresoVehicularDTO } from '../dto/RegistrarIngresoVehicularDTO';
import { IVEHICULO_REPOSITORY } from '../../../shared/domain/ports/tokens';

export class RegistrarIngresoVehicular {
  constructor(
    @Inject(IVEHICULO_REPOSITORY)
    private readonly vehiculoRepository: IVehiculoRepository,
    @Inject(IDOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: IDomainEventPublisher,
  ) {}

  async execute(dto: RegistrarIngresoVehicularDTO): Promise<void> {
    const placa = new Placa(dto.placa);
    const fecha = dto.fechaIngreso ?? new Date();

    let vehiculo = await this.vehiculoRepository.findByPlaca(placa);
    const kilometrajeAnterior = vehiculo?.obtenerUltimoKilometraje() ?? 0;

    if (!vehiculo) {
      vehiculo = new Vehiculo(
        crypto.randomUUID(),
        placa,
        dto.marca,
        dto.modelo,
        dto.anio,
        dto.tipoMotor,
        dto.clienteId,
      );
    }

    vehiculo.registrarIngresoKilometraje(dto.kilometrajeInicial, fecha);

    await this.vehiculoRepository.save(vehiculo);

    const evento = new KilometrajeActualizadoEvent({
      vehicleId: vehiculo.getId(),
      placa: dto.placa,
      nuevoKilometraje: dto.kilometrajeInicial,
      kilometrajeAnterior,
      origenCaptura: dto.origenCaptura ?? 'INGRESO_TALLER',
      fotoTableroUrl: dto.fotoTableroUrl,
    });

    await this.eventPublisher.publish(
      KilometrajeActualizadoEvent.EVENT_NAME,
      evento.toPayload(),
    );
  }
}

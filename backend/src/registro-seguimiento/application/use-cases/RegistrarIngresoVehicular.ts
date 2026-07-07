import { Vehiculo } from '../../domain/aggregates/Vehiculo';
import { Placa } from '../../../shared/domain/value-objects/Placa';
import { IVehiculoRepository } from '../../domain/ports/repositories/IVehiculoRepository';
import { IDomainEventPublisher } from '../../../shared/domain/ports/events/IDomainEventPublisher';
import { KilometrajeActualizadoEvent } from '../../domain/events/KilometrajeActualizadoEvent';
import { RegistrarIngresoVehicularDTO } from '../dto/RegistrarIngresoVehicularDTO';

export class RegistrarIngresoVehicular {
  constructor(
    private readonly vehiculoRepository: IVehiculoRepository,
    private readonly eventPublisher: IDomainEventPublisher,
  ) {}

  async execute(dto: RegistrarIngresoVehicularDTO): Promise<void> {
    const placa = new Placa(dto.placa);
    const fecha = dto.fechaIngreso ?? new Date();

    let vehiculo = await this.vehiculoRepository.findByPlaca(placa);

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

    await this.eventPublisher.publish(KilometrajeActualizadoEvent.EVENT_NAME, {
      placa: dto.placa,
      nuevoKilometraje: dto.kilometrajeInicial,
      fecha,
    });
  }
}

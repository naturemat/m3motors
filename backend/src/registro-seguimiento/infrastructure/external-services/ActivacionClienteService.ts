import { Injectable } from '@nestjs/common';
import { Placa } from '../../../shared/domain/value-objects/Placa';
import { VehicleQR } from '../../domain/value-objects/VehicleQR';
import { VehiclePhoto } from '../../domain/value-objects/VehiclePhoto';
import { Vehiculo } from '../../domain/aggregates/Vehiculo';
import { IOCRService } from '../../domain/ports/services/IOCRService';
import { IVehiculoRepository } from '../../domain/ports/repositories/IVehiculoRepository';
import { IDomainEventPublisher } from '../../../shared/domain/ports/events/IDomainEventPublisher';
import { ServicioGeneracionQR } from '../../domain/domain-services/ServicioGeneracionQR';

@Injectable()
export class ActivacionClienteService {
  constructor(
    private readonly ocrService: IOCRService,
    private readonly qrService: ServicioGeneracionQR,
    private readonly vehicleRepository: IVehiculoRepository,
    private readonly eventPublisher: IDomainEventPublisher,
  ) {}

  async ejecutar(params: {
    clienteId: string;
    workshopId: string;
    mechanicId: string;
    fotoPlaca: Buffer;
    mimeType: string;
    fotos: VehiclePhoto[];
  }): Promise<{
    vehicleId: string;
    placa: string;
    qr: VehicleQR;
  }> {
    const { clienteId, mechanicId, fotoPlaca, mimeType, fotos } = params;

    // 1. Reconocer placa desde la foto
    const placaTexto = await this.ocrService.reconocerPlaca(fotoPlaca, mimeType);
    const placa = new Placa(placaTexto);

    // 2. Validar que la placa no esté duplicada
    const existente = await this.vehicleRepository.findByPlaca(placa);
    if (existente) {
      throw new Error(`Ya existe un vehículo registrado con la placa ${placa.getValue()}`);
    }

    // 3. Validar que al menos haya foto de tipo PLACA
    const tieneFotoPlaca = fotos.some((f) => f.getTipo() === 'PLACA');
    if (!tieneFotoPlaca) {
      throw new Error('Se requiere al menos una foto de tipo PLACA para activar');
    }

    // 4. Crear el Vehicle aggregate
    const vehicleId = crypto.randomUUID();
    const vehicle = new Vehiculo(
      vehicleId,
      placa,
      'N/A',
      'N/A',
      new Date().getFullYear(),
      'GASOLINA',
      clienteId,
    );

    // 5. Generar QR único
    const qr = this.qrService.generarQR(vehicleId);

    // 6. Activar el vehículo con QR y fotos
    vehicle.activarVehiculo(mechanicId, qr, fotos);

    // 7. Guardar en BD
    await this.vehicleRepository.save(vehicle);

    // 8. Disparar eventos de dominio
    await this.eventPublisher.publish('vehiculo.activado', {
      vehicleId,
      placa: placa.getValue(),
      mechanicId,
      clienteId,
    });

    await this.eventPublisher.publish('qr.generado', {
      vehicleId,
      qrCode: qr.getCodigo(),
      qrUrl: qr.getUrl(),
    });

    return { vehicleId, placa: placa.getValue(), qr };
  }
}

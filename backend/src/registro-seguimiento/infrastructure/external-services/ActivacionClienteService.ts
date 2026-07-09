import { Inject, Injectable } from '@nestjs/common';
import { Placa } from '../../../shared/domain/value-objects/Placa';
import { VehicleQR } from '../../domain/value-objects/VehicleQR';
import { VehiclePhoto } from '../../domain/value-objects/VehiclePhoto';
import { Vehiculo } from '../../domain/aggregates/Vehiculo';
import { IOCRService } from '../../domain/ports/services/IOCRService';
import { IVehiculoRepository } from '../../domain/ports/repositories/IVehiculoRepository';
import {
  IDomainEventPublisher,
  IDOMAIN_EVENT_PUBLISHER,
} from '../../../shared/domain/ports/events/IDomainEventPublisher';
import { ServicioGeneracionQR } from '../../domain/domain-services/ServicioGeneracionQR';
import { VehiculoActivadoEvent } from '../../domain/events/VehiculoActivadoEvent';
import { QRGeneradoEvent } from '../../domain/events/QRGeneradoEvent';
import { ClienteActivadoEvent } from '../../domain/events/ClienteActivadoEvent';
import {
  IVEHICULO_REPOSITORY,
  IOCR_SERVICE,
  ISERVICIO_GENERACION_QR,
} from '../../../shared/domain/ports/tokens';

@Injectable()
export class ActivacionClienteService {
  constructor(
    @Inject(IOCR_SERVICE)
    private readonly ocrService: IOCRService,
    @Inject(ISERVICIO_GENERACION_QR)
    private readonly qrService: ServicioGeneracionQR,
    @Inject(IVEHICULO_REPOSITORY)
    private readonly vehicleRepository: IVehiculoRepository,
    @Inject(IDOMAIN_EVENT_PUBLISHER)
    private readonly eventPublisher: IDomainEventPublisher,
  ) {}

  async ejecutar(params: {
    clienteId: string;
    preRegisteredCustomerId: string;
    workshopId: string;
    mechanicId: string;
    clienteNombre: string;
    clienteTelefono: string;
    clienteEmail: string;
    fotoPlaca: Buffer;
    mimeType: string;
    fotos: VehiclePhoto[];
    marca: string;
    modelo: string;
    anio: number;
    tipoMotor: string;
  }): Promise<{
    vehicleId: string;
    placa: string;
    qr: VehicleQR;
  }> {
    const {
      clienteId,
      preRegisteredCustomerId,
      workshopId,
      mechanicId,
      clienteNombre,
      clienteTelefono,
      clienteEmail,
      fotoPlaca,
      mimeType,
      fotos,
      marca,
      modelo,
      anio,
      tipoMotor,
    } = params;

    const placaTexto = await this.ocrService.reconocerPlaca(
      fotoPlaca,
      mimeType,
    );
    const placa = new Placa(placaTexto);

    const existente = await this.vehicleRepository.findByPlaca(placa);
    if (existente) {
      throw new Error(
        `Ya existe un vehículo registrado con la placa ${placa.getValue()}`,
      );
    }

    const tieneFotoPlaca = fotos.some((f) => f.getTipo() === 'PLACA');
    if (!tieneFotoPlaca) {
      throw new Error(
        'Se requiere al menos una foto de tipo PLACA para activar',
      );
    }

    const vehicleId = crypto.randomUUID();
    const vehicle = new Vehiculo(
      vehicleId,
      placa,
      marca,
      modelo,
      anio,
      tipoMotor,
      clienteId,
    );

    const qr = this.qrService.generarQR(vehicleId);
    vehicle.activarVehiculo(mechanicId, qr, fotos);

    await this.vehicleRepository.save(vehicle);

    const eventoCliente = new ClienteActivadoEvent({
      clienteId,
      preRegisteredCustomerId,
      workshopId,
      mechanicId,
      nombre: clienteNombre,
      telefono: clienteTelefono,
      email: clienteEmail,
    });

    await this.eventPublisher.publish(
      ClienteActivadoEvent.EVENT_NAME,
      eventoCliente.toPayload(),
    );

    const eventoVehiculo = new VehiculoActivadoEvent({
      vehicleId,
      clienteId,
      placa: placa.getValue(),
      marca,
      modelo,
      anio,
      tipoMotor,
      activadoPor: mechanicId,
      fotos: fotos.map((f) => ({ tipo: f.getTipo(), url: f.getUrl() })),
    });

    await this.eventPublisher.publish(
      VehiculoActivadoEvent.EVENT_NAME,
      eventoVehiculo.toPayload(),
    );

    const eventoQR = new QRGeneradoEvent({
      vehicleId,
      qrCode: qr.getCodigo(),
      qrUrl: qr.getUrl(),
    });

    await this.eventPublisher.publish(
      QRGeneradoEvent.EVENT_NAME,
      eventoQR.toPayload(),
    );

    return { vehicleId, placa: placa.getValue(), qr };
  }
}

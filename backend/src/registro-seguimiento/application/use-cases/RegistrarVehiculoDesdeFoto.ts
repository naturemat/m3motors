import { Placa } from '../../../shared/domain/value-objects/Placa';
import { IOCRService } from '../../domain/ports/services/IOCRService';
import { IVehicleDataProvider } from '../../domain/ports/services/IVehicleDataProvider';
import { IEngineInfoService } from '../../domain/ports/services/IEngineInfoService';
import { RegistrarVehiculoDesdeFotoDTO } from '../dto/RegistrarVehiculoDesdeFotoDTO';

export interface VehiculoRegistrado {
  placa: string;
  vin: string;
  marca: string;
  modelo: string;
  anio: number;
  cilindrada: string;
  cilindros: string;
  distribucion: string;
  color: string;
  claseVehiculo: string;
}

export class RegistrarVehiculoDesdeFoto {
  constructor(
    private readonly ocrService: IOCRService,
    private readonly vehicleDataProvider: IVehicleDataProvider,
    private readonly engineInfoService: IEngineInfoService,
  ) {}

  async execute(
    dto: RegistrarVehiculoDesdeFotoDTO,
  ): Promise<VehiculoRegistrado> {
    const placaTexto = await this.ocrService.reconocerPlaca(
      dto.fotoBuffer,
      dto.mimeType,
    );
    const placa = new Placa(placaTexto);

    const datos = await this.vehicleDataProvider.obtenerDatosVehiculo(
      placa.getValueSinGuion(),
    );

    const specs = await this.engineInfoService.obtenerSpecsMotor(
      datos.marca,
      datos.modelo,
      datos.anio,
    );

    return {
      placa: datos.placa,
      vin: datos.vin,
      marca: datos.marca,
      modelo: datos.modelo,
      anio: datos.anio,
      cilindrada: specs.cilindrada,
      cilindros: specs.cilindros,
      distribucion: specs.distribucion,
      color: datos.color,
      claseVehiculo: datos.claseVehiculo,
    };
  }
}

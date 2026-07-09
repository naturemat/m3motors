import { Injectable } from '@nestjs/common';
import { chromium } from 'playwright';
import {
  IVehicleDataProvider,
  DatosVehiculoExterno,
} from '../../domain/ports/services/IVehicleDataProvider';

interface CampoLista {
  etiqueta: string;
  valor: string;
}

interface ApiResponse {
  campos: string;
}

interface CamposParsed {
  lsDatosIdentificacion: CampoLista[];
  lsDatosModelo: CampoLista[];
  lsOtrasCaracteristicas: CampoLista[];
}

@Injectable()
export class EcuadorVehicleDataProvider implements IVehicleDataProvider {
  private readonly urlBase =
    'https://servicios.axiscloud.ec/CRV/?ps_empresa=02';
  private readonly selectorInput = '#valorBusqueda';
  private readonly endpointDatos = '/paginas/datosVehiculo.jsp';

  async obtenerDatosVehiculo(placa: string): Promise<DatosVehiculoExterno> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(this.urlBase);

      const respuestaNetwork = page.waitForResponse(
        (res) => res.url().includes(this.endpointDatos) && res.status() === 200,
      );

      await page.waitForSelector(this.selectorInput);
      await page.fill(this.selectorInput, placa);
      await page.press(this.selectorInput, 'Enter');

      const respuesta = await respuestaNetwork;
      const json = (await respuesta.json()) as ApiResponse;
      const campos = JSON.parse(json.campos) as CamposParsed;

      return {
        placa,
        vin: this.extraerCampo(campos.lsDatosIdentificacion, 'VIN:'),
        codigoMotor: this.extraerCampo(campos.lsDatosIdentificacion, 'Motor:'),
        marca: this.extraerCampo(campos.lsDatosModelo, 'Marca:'),
        modelo: this.extraerCampo(campos.lsDatosModelo, 'Modelo:'),
        anio:
          parseInt(
            this.extraerCampo(campos.lsDatosModelo, 'Año Fabricación:'),
          ) || 0,
        paisFabricacion: this.extraerCampo(
          campos.lsDatosModelo,
          'País Fabricación:',
        ),
        color: this.extraerCampo(campos.lsOtrasCaracteristicas, 'Color 1:'),
        claseVehiculo: this.extraerCampo(
          campos.lsOtrasCaracteristicas,
          'Clase Vehículo:',
        ),
        tipoVehiculo: this.extraerCampo(
          campos.lsOtrasCaracteristicas,
          'Tipo Vehículo:',
        ),
      };
    } finally {
      await browser.close();
    }
  }

  private extraerCampo(lista: CampoLista[], etiqueta: string): string {
    if (!lista) return 'N/A';
    const registro = lista.find((item) => item.etiqueta === etiqueta);
    return registro?.valor?.trim() ?? 'N/A';
  }
}

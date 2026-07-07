import { EcuadorVehicleDataProvider } from '../../../../src/registro-seguimiento/infrastructure/external-services/EcuadorVehicleDataProvider';
import { chromium } from 'playwright';

jest.mock('playwright', () => {
  const mockPage = {
    goto: jest.fn(),
    waitForSelector: jest.fn(),
    fill: jest.fn(),
    press: jest.fn(),
    waitForResponse: jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        campos: JSON.stringify({
          lsDatosIdentificacion: [
            { etiqueta: 'VIN:', valor: '  1HGBH41JXMN109186  ' },
            { etiqueta: 'Motor:', valor: '  F23A4  ' },
          ],
          lsDatosModelo: [
            { etiqueta: 'Marca:', valor: '  TOYOTA  ' },
            { etiqueta: 'Modelo:', valor: '  COROLLA  ' },
            { etiqueta: 'Año Fabricación:', valor: '  2020  ' },
            { etiqueta: 'País Fabricación:', valor: '  ECUADOR  ' },
          ],
          lsOtrasCaracteristicas: [
            { etiqueta: 'Color 1:', valor: '  BLANCO  ' },
            { etiqueta: 'Clase Vehículo:', valor: '  AUTOMOVIL  ' },
            { etiqueta: 'Tipo Vehículo:', valor: '  SEDAN  ' },
          ],
        }),
      }),
    }),
  };

  return {
    chromium: {
      launch: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn(),
      }),
    },
  };
});

describe('EcuadorVehicleDataProvider', () => {
  let provider: EcuadorVehicleDataProvider;

  beforeEach(() => {
    provider = new EcuadorVehicleDataProvider();
  });

  it('debe obtener datos del vehículo desde la placa', async () => {
    const resultado = await provider.obtenerDatosVehiculo('PBA1234');

    expect(resultado).toEqual({
      placa: 'PBA1234',
      vin: '1HGBH41JXMN109186',
      codigoMotor: 'F23A4',
      marca: 'TOYOTA',
      modelo: 'COROLLA',
      anio: 2020,
      paisFabricacion: 'ECUADOR',
      color: 'BLANCO',
      claseVehiculo: 'AUTOMOVIL',
      tipoVehiculo: 'SEDAN',
    });
  });

  it('debe retornar N/A para campos no encontrados', async () => {
    const mockPage = {
      goto: jest.fn(),
      waitForSelector: jest.fn(),
      fill: jest.fn(),
      press: jest.fn(),
      waitForResponse: jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          campos: JSON.stringify({
            lsDatosIdentificacion: [],
            lsDatosModelo: [],
            lsOtrasCaracteristicas: [],
          }),
        }),
      }),
    };
    (chromium.launch as jest.Mock).mockResolvedValue({
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    });

    const resultado = await provider.obtenerDatosVehiculo('ZZZ0000');

    expect(resultado.vin).toBe('N/A');
    expect(resultado.marca).toBe('N/A');
    expect(resultado.modelo).toBe('N/A');
  });
});

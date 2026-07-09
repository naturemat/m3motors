import { RegistrarVehiculoDesdeFoto } from '../../../../src/registro-seguimiento/application/use-cases/RegistrarVehiculoDesdeFoto';
import { IOCRService } from '../../../../src/registro-seguimiento/domain/ports/services/IOCRService';
import { IVehicleDataProvider } from '../../../../src/registro-seguimiento/domain/ports/services/IVehicleDataProvider';
import { IEngineInfoService } from '../../../../src/registro-seguimiento/domain/ports/services/IEngineInfoService';

describe('RegistrarVehiculoDesdeFoto', () => {
  let useCase: RegistrarVehiculoDesdeFoto;
  let mockOCR: jest.Mocked<IOCRService>;
  let mockDataProvider: jest.Mocked<IVehicleDataProvider>;
  let mockEngineInfo: jest.Mocked<IEngineInfoService>;

  beforeEach(() => {
    mockOCR = { reconocerPlaca: jest.fn() };
    mockDataProvider = { obtenerDatosVehiculo: jest.fn() };
    mockEngineInfo = { obtenerSpecsMotor: jest.fn() };
    useCase = new RegistrarVehiculoDesdeFoto(
      mockOCR,
      mockDataProvider,
      mockEngineInfo,
    );
  });

  it('debe registrar un vehículo completo desde una foto', async () => {
    mockOCR.reconocerPlaca.mockResolvedValue('PBA1234');
    mockDataProvider.obtenerDatosVehiculo.mockResolvedValue({
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
    mockEngineInfo.obtenerSpecsMotor.mockResolvedValue({
      cilindrada: '1.8L',
      cilindros: '4 cilindros en línea',
      distribucion: 'DOHC 16 válvulas',
    });

    const resultado = await useCase.execute({
      fotoBuffer: Buffer.from('fake-image'),
      mimeType: 'image/jpeg',
      mecanicoId: 'MEC-001',
    });

    expect(resultado).toEqual({
      placa: 'PBA1234',
      vin: '1HGBH41JXMN109186',
      marca: 'TOYOTA',
      modelo: 'COROLLA',
      anio: 2020,
      cilindrada: '1.8L',
      cilindros: '4 cilindros en línea',
      distribucion: 'DOHC 16 válvulas',
      color: 'BLANCO',
      claseVehiculo: 'AUTOMOVIL',
    });
  });

  it('debe lanzar error si el OCR no detecta placa', async () => {
    mockOCR.reconocerPlaca.mockRejectedValue(
      new Error('No se pudo extraer ningún texto de placa de la imagen'),
    );

    await expect(
      useCase.execute({
        fotoBuffer: Buffer.from('fake-image'),
        mimeType: 'image/jpeg',
        mecanicoId: 'MEC-001',
      }),
    ).rejects.toThrow('No se pudo extraer ningún texto de placa de la imagen');
  });

  it('debe lanzar error si la placa tiene formato inválido', async () => {
    mockOCR.reconocerPlaca.mockResolvedValue('placa invalida');

    await expect(
      useCase.execute({
        fotoBuffer: Buffer.from('fake-image'),
        mimeType: 'image/jpeg',
        mecanicoId: 'MEC-001',
      }),
    ).rejects.toThrow('Placa inválida');
  });

  it('debe lanzar error si el proveedor de datos falla', async () => {
    mockOCR.reconocerPlaca.mockResolvedValue('PBA1234');
    mockDataProvider.obtenerDatosVehiculo.mockRejectedValue(
      new Error('Error de conexión con el servicio gubernamental'),
    );

    await expect(
      useCase.execute({
        fotoBuffer: Buffer.from('fake-image'),
        mimeType: 'image/jpeg',
        mecanicoId: 'MEC-001',
      }),
    ).rejects.toThrow('Error de conexión con el servicio gubernamental');
  });

  it('debe lanzar error si Groq no responde', async () => {
    mockOCR.reconocerPlaca.mockResolvedValue('PBA1234');
    mockDataProvider.obtenerDatosVehiculo.mockResolvedValue({
      placa: 'PBA1234',
      vin: 'N/A',
      codigoMotor: 'N/A',
      marca: 'TOYOTA',
      modelo: 'COROLLA',
      anio: 2020,
      paisFabricacion: 'N/A',
      color: 'N/A',
      claseVehiculo: 'N/A',
      tipoVehiculo: 'N/A',
    });
    mockEngineInfo.obtenerSpecsMotor.mockRejectedValue(
      new Error('Error en Groq API: 500'),
    );

    await expect(
      useCase.execute({
        fotoBuffer: Buffer.from('fake-image'),
        mimeType: 'image/jpeg',
        mecanicoId: 'MEC-001',
      }),
    ).rejects.toThrow('Error en Groq API: 500');
  });

  it('debe llamar a Groq con marca, modelo y año correctos', async () => {
    mockOCR.reconocerPlaca.mockResolvedValue('PBA1234');
    mockDataProvider.obtenerDatosVehiculo.mockResolvedValue({
      placa: 'PBA1234',
      vin: 'N/A',
      codigoMotor: 'N/A',
      marca: 'CHEVROLET',
      modelo: 'AVEO',
      anio: 2014,
      paisFabricacion: 'N/A',
      color: 'N/A',
      claseVehiculo: 'N/A',
      tipoVehiculo: 'N/A',
    });
    mockEngineInfo.obtenerSpecsMotor.mockResolvedValue({
      cilindrada: '1.6L',
      cilindros: '4 cilindros',
      distribucion: 'DOHC',
    });

    await useCase.execute({
      fotoBuffer: Buffer.from('fake-image'),
      mimeType: 'image/jpeg',
      mecanicoId: 'MEC-001',
    });

    expect(mockEngineInfo.obtenerSpecsMotor).toHaveBeenCalledWith(
      'CHEVROLET',
      'AVEO',
      2014,
    );
  });
});

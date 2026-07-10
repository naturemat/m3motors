import api from '../api';
import {customersService} from '../customers';

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedGet = api.get as jest.Mock;

describe('customersService.searchPreRegisteredCustomers', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('envía el query al endpoint para buscar por nombre, teléfono o placa', async () => {
    mockedGet.mockResolvedValue({
      data: {
        data: [],
        meta: {total: 0, skip: 0, take: 20},
      },
    });

    await customersService.searchPreRegisteredCustomers({
      q: 'PBA-1234',
      status: 'ALL',
      skip: 0,
      take: 20,
      orderBy: 'date_desc',
    });

    expect(mockedGet).toHaveBeenCalledWith('/activation/pre-registered', {
      params: {
        q: 'PBA-1234',
        status: 'ALL',
        skip: 0,
        take: 20,
        orderBy: 'date_desc',
      },
    });
  });

  it('mapea clientes pendientes y activados correctamente', async () => {
    mockedGet.mockResolvedValue({
      data: {
        data: [
          {
            id: 1,
            nombre: 'Carlos Pérez',
            telefono: '+593991234567',
            email: 'carlos@email.com',
            licensePlate: 'PBA-1234',
            status: 'PENDING',
            fechaPreRegistro: '2026-01-15T00:00:00.000Z',
            idVehiculoConverted: null,
          },
          {
            id: 2,
            nombre: 'María López',
            telefono: '+593987654321',
            email: 'maria@email.com',
            licensePlate: 'ABC-5678',
            status: 'ACTIVATED',
            fechaPreRegistro: '2026-01-10T00:00:00.000Z',
            idVehiculoConverted: 42,
          },
        ],
        meta: {total: 2, skip: 0, take: 20},
      },
    });

    const result = await customersService.searchPreRegisteredCustomers({
      q: '987654321',
    });

    expect(result.data).toEqual([
      {
        id: '1',
        nombre: 'Carlos Pérez',
        telefono: '+593991234567',
        email: 'carlos@email.com',
        licensePlate: 'PBA-1234',
        status: 'pending',
        vehicleId: undefined,
        fechaPreRegistro: '2026-01-15T00:00:00.000Z',
      },
      {
        id: '2',
        nombre: 'María López',
        telefono: '+593987654321',
        email: 'maria@email.com',
        licensePlate: 'ABC-5678',
        status: 'active',
        vehicleId: '42',
        fechaPreRegistro: '2026-01-10T00:00:00.000Z',
      },
    ]);
    expect(result.meta.total).toBe(2);
  });

  it('propaga errores del API', async () => {
    mockedGet.mockRejectedValue(new Error('Network error'));

    await expect(
      customersService.searchPreRegisteredCustomers({q: 'test'}),
    ).rejects.toThrow('Network error');
  });
});

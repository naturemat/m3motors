import { RegistrarIngresoVehicular } from '../../../src/application/use-cases/RegistrarIngresoVehicular';
import { IVehiculoRepository } from '../../../src/domain/ports/repositories/IVehiculoRepository';
import { IDomainEventPublisher } from '../../../src/domain/ports/events/IDomainEventPublisher';
import { Vehiculo } from '../../../src/domain/aggregates/Vehiculo';
import { Placa } from '../../../src/domain/value-objects/Placa';
import { KilometrajeActualizadoEvent } from '../../../src/domain/events/KilometrajeActualizadoEvent';

describe('RegistrarIngresoVehicular (Use Case)', () => {
  let useCase: RegistrarIngresoVehicular;
  let mockRepo: jest.Mocked<IVehiculoRepository>;
  let mockPublisher: jest.Mocked<IDomainEventPublisher>;

  beforeEach(() => {
    mockRepo = {
      findByPlaca: jest.fn(),
      save: jest.fn(),
    };
    mockPublisher = {
      publish: jest.fn(),
    };
    useCase = new RegistrarIngresoVehicular(mockRepo, mockPublisher);
  });

  it('debe crear un nuevo vehículo si no existe y registrar el kilometraje', async () => {
    mockRepo.findByPlaca.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(undefined);
    mockPublisher.publish.mockResolvedValue(undefined);

    await useCase.execute({
      placa: 'XYZ-123',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2022,
      tipoMotor: 'Gasolina',
      kilometrajeInicial: 5000,
    });

    expect(mockRepo.findByPlaca).toHaveBeenCalledTimes(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const vehiculoGuardado = mockRepo.save.mock.calls[0][0];
    expect(vehiculoGuardado.getRegistrosKilometraje().length).toBe(1);
    expect(vehiculoGuardado.getRegistrosKilometraje()[0].getValorKm()).toBe(
      5000,
    );
  });

  it('debe actualizar el kilometraje de un vehículo existente', async () => {
    const placaExistente = new Placa('XYZ-123');
    const vehiculoExistente = new Vehiculo(
      placaExistente,
      'Toyota',
      'Corolla',
      2022,
      'Gasolina',
    );
    vehiculoExistente.registrarIngresoKilometraje(3000, new Date('2026-01-01'));
    mockRepo.findByPlaca.mockResolvedValue(vehiculoExistente);
    mockRepo.save.mockResolvedValue(undefined);
    mockPublisher.publish.mockResolvedValue(undefined);

    await useCase.execute({
      placa: 'XYZ-123',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2022,
      tipoMotor: 'Gasolina',
      kilometrajeInicial: 6000,
      fechaIngreso: new Date('2026-06-01'),
    });

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const vehiculoGuardado = mockRepo.save.mock.calls[0][0];
    expect(vehiculoGuardado.getRegistrosKilometraje().length).toBe(2);
  });

  it('debe publicar el evento KilometrajeActualizado', async () => {
    mockRepo.findByPlaca.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue(undefined);
    mockPublisher.publish.mockResolvedValue(undefined);

    await useCase.execute({
      placa: 'ABC-456',
      marca: 'Honda',
      modelo: 'Civic',
      anio: 2021,
      tipoMotor: 'Gasolina',
      kilometrajeInicial: 1000,
    });

    expect(mockPublisher.publish).toHaveBeenCalledWith(
      KilometrajeActualizadoEvent.EVENT_NAME,
      expect.objectContaining({ placa: 'ABC-456', nuevoKilometraje: 1000 }),
    );
  });

  it('debe lanzar error si la placa tiene formato inválido', async () => {
    await expect(
      useCase.execute({
        placa: 'invalida',
        marca: 'Honda',
        modelo: 'Civic',
        anio: 2021,
        tipoMotor: 'Gasolina',
        kilometrajeInicial: 1000,
      }),
    ).rejects.toThrow('Placa inválida');
  });
});

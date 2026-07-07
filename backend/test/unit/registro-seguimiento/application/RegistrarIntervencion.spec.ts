import { RegistrarIntervencion } from '../../../../src/registro-seguimiento/application/use-cases/RegistrarIntervencion';
import { IVehiculoRepository } from '../../../../src/registro-seguimiento/domain/ports/repositories/IVehiculoRepository';
import { IDomainEventPublisher } from '../../../../src/shared/domain/ports/events/IDomainEventPublisher';
import { Vehiculo } from '../../../../src/registro-seguimiento/domain/aggregates/Vehiculo';
import { Placa } from '../../../../src/shared/domain/value-objects/Placa';
import { IntervencionRegistradaEvent } from '../../../../src/registro-seguimiento/domain/events/IntervencionRegistradaEvent';

describe('RegistrarIntervencion (Use Case)', () => {
  let useCase: RegistrarIntervencion;
  let mockRepo: jest.Mocked<IVehiculoRepository>;
  let mockPublisher: jest.Mocked<IDomainEventPublisher>;
  let vehiculoExistente: Vehiculo;

  const fechaBase = new Date('2026-01-01T00:00:00Z');
  const fechaIntervencion = new Date('2026-06-01T00:00:00Z');

  beforeEach(() => {
    mockRepo = {
      findByPlaca: jest.fn(),
      save: jest.fn(),
    };
    mockPublisher = {
      publish: jest.fn(),
    };
    useCase = new RegistrarIntervencion(mockRepo, mockPublisher);

    vehiculoExistente = new Vehiculo(
      'veh-1',
      new Placa('ABC-123'),
      'Toyota',
      'Corolla',
      2020,
      'Gasolina',
      'cli-1',
    );
    vehiculoExistente.registrarIngresoKilometraje(5000, fechaBase);
  });

  it('debe registrar una intervención sobre un vehículo existente', async () => {
    mockRepo.findByPlaca.mockResolvedValue(vehiculoExistente);
    mockRepo.save.mockResolvedValue(undefined);
    mockPublisher.publish.mockResolvedValue(undefined);

    await useCase.execute({
      placa: 'ABC-123',
      fecha: fechaIntervencion,
      kilometrajeActual: 8000,
      diagnostico: 'Cambio de aceite',
      observacionesMecanico: 'Se realizó cambio completo',
      nivelSeveridad: 'BAJA',
      componentes: [{ nombre: 'Filtro de aceite', kilometrajeInstalacion: 0, limiteKilometrajeFabricante: 50000 }],
      mecanicoId: 'MEC-001',
      manoDeObra: 80,
    });

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const vehiculoGuardado = mockRepo.save.mock.calls[0][0];
    expect(vehiculoGuardado.getHistorialEvolutivo().length).toBe(1);
    expect(vehiculoGuardado.getRegistrosKilometraje().length).toBe(2);
  });

  it('debe registrar múltiples componentes en la intervención', async () => {
    mockRepo.findByPlaca.mockResolvedValue(vehiculoExistente);
    mockRepo.save.mockResolvedValue(undefined);
    mockPublisher.publish.mockResolvedValue(undefined);

    await useCase.execute({
      placa: 'ABC-123',
      fecha: fechaIntervencion,
      kilometrajeActual: 8000,
      diagnostico: 'Mantenimiento mayor',
      observacionesMecanico: 'Revisión completa del motor',
      nivelSeveridad: 'MEDIA',
      componentes: [
        { nombre: 'Filtro de aceite', kilometrajeInstalacion: 0, limiteKilometrajeFabricante: 50000 },
        { nombre: 'Pastillas de freno', kilometrajeInstalacion: 0, limiteKilometrajeFabricante: 80000 },
      ],
      mecanicoId: 'MEC-001',
      manoDeObra: 200,
    });

    const vehiculoGuardado = mockRepo.save.mock.calls[0][0];
    const intervencion = vehiculoGuardado.getHistorialEvolutivo()[0];
    expect(intervencion.getComponentesSustituidos().length).toBe(2);
  });

  it('debe publicar el evento IntervencionRegistrada', async () => {
    mockRepo.findByPlaca.mockResolvedValue(vehiculoExistente);
    mockRepo.save.mockResolvedValue(undefined);
    mockPublisher.publish.mockResolvedValue(undefined);

    await useCase.execute({
      placa: 'ABC-123',
      fecha: fechaIntervencion,
      kilometrajeActual: 8000,
      diagnostico: 'Revisión general',
      observacionesMecanico: 'Revisión del sistema completo',
      nivelSeveridad: 'BAJA',
      componentes: [],
      mecanicoId: 'MEC-001',
      manoDeObra: 50,
    });

    expect(mockPublisher.publish).toHaveBeenCalledWith(
      IntervencionRegistradaEvent.EVENT_NAME,
      expect.objectContaining({
        placa: 'ABC-123',
        diagnostico: 'Revisión general',
      }),
    );
  });

  it('debe lanzar error si el vehículo no existe', async () => {
    mockRepo.findByPlaca.mockResolvedValue(null);

    await expect(
      useCase.execute({
        placa: 'ZZZ-999',
        fecha: fechaIntervencion,
        kilometrajeActual: 8000,
        diagnostico: 'Test',
        observacionesMecanico: 'Test observaciones',
        nivelSeveridad: 'BAJA',
        componentes: [],
        mecanicoId: 'MEC-001',
        manoDeObra: 50,
      }),
    ).rejects.toThrow('Vehículo con placa ZZZ-999 no encontrado.');
  });
});

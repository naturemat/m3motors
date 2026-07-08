import { Cliente } from '../../../../src/registro-seguimiento/domain/entities/Cliente';
import { ClienteId } from '../../../../src/registro-seguimiento/domain/value-objects/ClienteId';
import { Placa } from '../../../../src/shared/domain/value-objects/Placa';

describe('Cliente Entity', () => {
  let cliente: Cliente;

  beforeEach(() => {
    cliente = new Cliente(
      new ClienteId('uuid-1'),
      'Juan Perez',
      '0999999999',
      'juan@test.com',
      'chat123',
    );
  });

  it('debe asociar un nuevo vehículo', () => {
    cliente.activarCliente('MEC-001');
    const placa = new Placa('XYZ-987');
    cliente.asociarNuevoVehiculo(placa);
    expect(cliente.getVehiculosAsociados().length).toBe(1);
    expect(cliente.getVehiculosAsociados()[0].getValue()).toBe('XYZ-987');
  });

  it('debe lanzar error al asociar un vehículo que ya existe', () => {
    cliente.activarCliente('MEC-001');
    const placa = new Placa('XYZ-987');
    cliente.asociarNuevoVehiculo(placa);
    expect(() => cliente.asociarNuevoVehiculo(placa)).toThrow(
      'El vehículo ya está asociado a este cliente',
    );
  });

  it('debe actualizar los canales de contacto', () => {
    cliente.actualizarCanalesContacto(
      '0888888888',
      'nuevo@test.com',
      'chat456',
    );
    expect(cliente.getTelefono()).toBe('0888888888');
    expect(cliente.getEmail()).toBe('nuevo@test.com');
    expect(cliente.getTelegramChatId()).toBe('chat456');
  });

  it('debe lanzar error si el email de contacto es inválido', () => {
    expect(() =>
      cliente.actualizarCanalesContacto('0991234567', 'email-invalido', '123'),
    ).toThrow('Formato de email inválido');
  });
});

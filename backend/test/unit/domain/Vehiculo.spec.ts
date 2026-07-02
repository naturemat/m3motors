import { Vehiculo } from '../../../src/domain/entities/Vehiculo';
import { Placa } from '../../../src/domain/value-objects/Placa';
import { Intervencion } from '../../../src/domain/entities/Intervencion';
import { IntervencionId } from '../../../src/domain/value-objects/IntervencionId';
import { DiagnosticoTecnico } from '../../../src/domain/value-objects/DiagnosticoTecnico';
import { MecanicoId } from '../../../src/domain/value-objects/MecanicoId';
import { ComponenteCritico } from '../../../src/domain/value-objects/ComponenteCritico';

describe('Vehiculo Entity', () => {
  let vehiculo: Vehiculo;
  let placa: Placa;

  beforeEach(() => {
    placa = new Placa('ABC-1234');
    vehiculo = new Vehiculo(placa, 'Toyota', 'Corolla', 2020, 'Gasolina');
  });

  it('debe registrar un ingreso de kilometraje mayor al anterior', () => {
    vehiculo.registrarIngresoKilometraje(100);
    expect(vehiculo.getRegistrosKilometraje().length).toBe(1);
    expect(vehiculo.getRegistrosKilometraje()[0].getValorKm()).toBe(100);

    vehiculo.registrarIngresoKilometraje(150);
    expect(vehiculo.getRegistrosKilometraje().length).toBe(2);
    expect(vehiculo.getRegistrosKilometraje()[1].getValorKm()).toBe(150);
  });

  it('debe lanzar error al registrar un kilometraje menor al anterior', () => {
    vehiculo.registrarIngresoKilometraje(100);
    expect(() => vehiculo.registrarIngresoKilometraje(50)).toThrow('El nuevo kilometraje no puede ser menor al registro anterior');
  });

  it('debe recalcular la tasa de desgaste basada en los registros', () => {
    vehiculo.registrarIngresoKilometraje(100);
    vehiculo.registrarIngresoKilometraje(200);
    vehiculo.recalcularTasaDesgasteSemanal();
    expect(vehiculo.getTasaDesgasteActual().getPorcentaje()).toBeGreaterThan(0);
  });

  it('debe vincular una nueva intervención', () => {
    const intervencion = new Intervencion(
      new IntervencionId('123'),
      new Date(),
      new DiagnosticoTecnico('Falla motor'),
      100,
      new MecanicoId('MEC-1')
    );
    vehiculo.vincularNuevaIntervencion(intervencion);
    expect(vehiculo.getHistorialEvolutivo().length).toBe(1);
  });
});

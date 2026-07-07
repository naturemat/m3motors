import { Vehiculo } from '../../../../src/registro-seguimiento/domain/aggregates/Vehiculo';
import { Placa } from '../../../../src/shared/domain/value-objects/Placa';
import { Intervencion } from '../../../../src/registro-seguimiento/domain/entities/Intervencion';
import { IntervencionId } from '../../../../src/registro-seguimiento/domain/value-objects/IntervencionId';
import { DiagnosticoTecnico } from '../../../../src/registro-seguimiento/domain/value-objects/DiagnosticoTecnico';
import { MecanicoId } from '../../../../src/registro-seguimiento/domain/value-objects/MecanicoId';
import { ComponenteCritico } from '../../../../src/registro-seguimiento/domain/value-objects/ComponenteCritico';

describe('Vehiculo Aggregate Root', () => {
  let vehiculo: Vehiculo;
  let placa: Placa;
  let hoy: Date;
  let ayer: Date;

  beforeEach(() => {
    placa = new Placa('ABC-1234');
    vehiculo = new Vehiculo(
      'veh-1',
      placa,
      'Toyota',
      'Corolla',
      2020,
      'Gasolina',
      'cli-1',
    );
    hoy = new Date('2026-07-02T10:00:00Z');
    ayer = new Date('2026-07-01T10:00:00Z');
  });

  it('debe registrar un ingreso de kilometraje mayor al anterior respetando orden cronológico', () => {
    vehiculo.registrarIngresoKilometraje(100, ayer);
    expect(vehiculo.getRegistrosKilometraje().length).toBe(1);

    vehiculo.registrarIngresoKilometraje(150, hoy);
    expect(vehiculo.getRegistrosKilometraje().length).toBe(2);
  });

  it('debe lanzar error por inconsistencia cronológica', () => {
    vehiculo.registrarIngresoKilometraje(100, hoy);
    expect(() => vehiculo.registrarIngresoKilometraje(150, ayer)).toThrow(
      'Inconsistencia cronológica: no se puede registrar un evento en una fecha anterior al último evento validado.',
    );
  });

  it('debe vincular nueva intervención respetando orden cronológico', () => {
    vehiculo.registrarIngresoKilometraje(100, ayer);

    const intervencion = new Intervencion(
      new IntervencionId('123'),
      hoy,
      new DiagnosticoTecnico(
        'Falla motor',
        'Observaciones del mecánico',
        'MEDIA',
      ),
      100,
      new MecanicoId('MEC-1'),
    );
    vehiculo.vincularNuevaIntervencion(intervencion);
    expect(vehiculo.getHistorialEvolutivo().length).toBe(1);
  });

  it('debe lanzar error al vincular intervención en fecha pasada al último kilometraje', () => {
    vehiculo.registrarIngresoKilometraje(100, hoy);

    const intervencionPasada = new Intervencion(
      new IntervencionId('123'),
      ayer,
      new DiagnosticoTecnico(
        'Falla motor',
        'Observaciones del mecánico',
        'MEDIA',
      ),
      100,
      new MecanicoId('MEC-1'),
    );

    expect(() =>
      vehiculo.vincularNuevaIntervencion(intervencionPasada),
    ).toThrow(
      'Inconsistencia cronológica: no se puede registrar un evento en una fecha anterior al último evento validado.',
    );
  });

  it('debe delegar la agregación de componentes a la intervención correcta', () => {
    const intId = new IntervencionId('INT-1');
    const intervencion = new Intervencion(
      intId,
      hoy,
      new DiagnosticoTecnico(
        'Falla motor',
        'Observaciones del mecánico',
        'MEDIA',
      ),
      100,
      new MecanicoId('MEC-1'),
    );
    vehiculo.vincularNuevaIntervencion(intervencion);

    vehiculo.agregarComponenteAIntervencion(
      intId,
      new ComponenteCritico('comp-1', 'Filtro', 50000, 60000),
    );
    expect(intervencion.getComponentesSustituidos().length).toBe(1);
  });

  it('debe delegar la finalización de la intervención', () => {
    const intId = new IntervencionId('INT-2');
    const intervencion = new Intervencion(
      intId,
      hoy,
      new DiagnosticoTecnico(
        'Revisión',
        'Revisión completa del sistema',
        'BAJA',
      ),
      50,
      new MecanicoId('MEC-1'),
    );
    vehiculo.vincularNuevaIntervencion(intervencion);

    vehiculo.finalizarIntervencion(intId);
    expect(intervencion.getEstado()).toBe('FINALIZADO');
  });

  it('debe lanzar error si intenta operar sobre una intervención inexistente', () => {
    const intIdFalsa = new IntervencionId('INT-FALSE');
    expect(() => vehiculo.finalizarIntervencion(intIdFalsa)).toThrow(
      'Intervención no encontrada en el historial del vehículo.',
    );
  });
});

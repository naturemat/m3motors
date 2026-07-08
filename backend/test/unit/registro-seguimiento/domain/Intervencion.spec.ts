import { Intervencion } from '../../../../src/registro-seguimiento/domain/entities/Intervencion';
import { IntervencionId } from '../../../../src/registro-seguimiento/domain/value-objects/IntervencionId';
import { DiagnosticoTecnico } from '../../../../src/registro-seguimiento/domain/value-objects/DiagnosticoTecnico';
import { ComponenteCritico } from '../../../../src/registro-seguimiento/domain/value-objects/ComponenteCritico';
import { MecanicoId } from '../../../../src/registro-seguimiento/domain/value-objects/MecanicoId';

describe('Intervencion Entity', () => {
  let intervencion: Intervencion;

  beforeEach(() => {
    intervencion = new Intervencion(
      new IntervencionId('int-1'),
      new Date(),
      new DiagnosticoTecnico(
        'Revisión general',
        'MEDIA',
        'Revisión completa del motor',
      ),
      50.0,
      new MecanicoId('mec-1'),
    );
  });

  it('debe registrar un componente sustituido si esta PENDIENTE', () => {
    const componente = new ComponenteCritico(
      'comp-1',
      'Filtro de Aceite',
      50000,
      60000,
    );
    intervencion.registrarSustitucionComponente(componente);
    expect(intervencion.getComponentesSustituidos().length).toBe(1);
    expect(intervencion.getComponentesSustituidos()[0].getNombre()).toBe(
      'Filtro de Aceite',
    );
  });

  it('debe cambiar el estado a FINALIZADO', () => {
    intervencion.finalizarIntervencion();
    expect(intervencion.getEstado()).toBe('FINALIZADO');
  });

  it('no debe permitir registrar componentes si está FINALIZADO', () => {
    intervencion.finalizarIntervencion();
    const componente = new ComponenteCritico(
      'comp-2',
      'Filtro de Aceite',
      50000,
      60000,
    );
    expect(() =>
      intervencion.registrarSustitucionComponente(componente),
    ).toThrow('La operación no está permitida en una intervención finalizada');
  });

  it('no debe permitir finalizar si ya está FINALIZADA', () => {
    intervencion.finalizarIntervencion();
    expect(() => intervencion.finalizarIntervencion()).toThrow(
      'La operación no está permitida en una intervención finalizada',
    );
  });
});

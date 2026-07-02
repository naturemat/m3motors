import { Intervencion } from '../../../src/domain/entities/Intervencion';
import { IntervencionId } from '../../../src/domain/value-objects/IntervencionId';
import { DiagnosticoTecnico } from '../../../src/domain/value-objects/DiagnosticoTecnico';
import { ComponenteCritico } from '../../../src/domain/value-objects/ComponenteCritico';
import { MecanicoId } from '../../../src/domain/value-objects/MecanicoId';

describe('Intervencion Entity', () => {
  let intervencion: Intervencion;

  beforeEach(() => {
    intervencion = new Intervencion(
      new IntervencionId('int-1'),
      new Date(),
      new DiagnosticoTecnico('Revisión general'),
      50.0,
      new MecanicoId('mec-1')
    );
  });

  it('debe registrar un componente sustituido si esta PENDIENTE', () => {
    const componente = new ComponenteCritico('Filtro de Aceite', 12);
    intervencion.registrarSustitucionComponente(componente);
    expect(intervencion.getComponentesSustituidos().length).toBe(1);
    expect(intervencion.getComponentesSustituidos()[0].getNombre()).toBe('Filtro de Aceite');
  });

  it('debe cambiar el estado a FINALIZADO', () => {
    intervencion.finalizarIntervencion();
    expect(intervencion.getEstado()).toBe('FINALIZADO');
  });

  it('no debe permitir registrar componentes si está FINALIZADO', () => {
    intervencion.finalizarIntervencion();
    const componente = new ComponenteCritico('Filtro de Aceite', 12);
    expect(() => intervencion.registrarSustitucionComponente(componente)).toThrow('La operación no está permitida en una intervención finalizada');
  });

  it('no debe permitir finalizar si ya está FINALIZADA', () => {
    intervencion.finalizarIntervencion();
    expect(() => intervencion.finalizarIntervencion()).toThrow('La operación no está permitida en una intervención finalizada');
  });
});

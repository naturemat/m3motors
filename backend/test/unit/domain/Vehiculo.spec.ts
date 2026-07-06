import { Vehiculo } from '../../../src/domain/aggregates/Vehiculo';
import { Placa } from '../../../src/domain/value-objects/Placa';
import { Intervencion } from '../../../src/domain/entities/Intervencion';
import { IntervencionId } from '../../../src/domain/value-objects/IntervencionId';
import { ComponenteCritico } from '../../../src/domain/value-objects/ComponenteCritico';
import { MecanicoId } from '../../../src/domain/value-objects/MecanicoId';
import { ClienteId } from '../../../src/domain/value-objects/ClienteId';
import { DiagnosticoTecnico } from '../../../src/domain/value-objects/DiagnosticoTecnico';

describe('Vehiculo Aggregate', () => {
  let placa: Placa;

  beforeEach(() => {
    placa = new Placa('PBA-1234');
  });

  it('debe crear un vehiculo correctamente con datos validos', () => {
    const vehiculo = new Vehiculo(placa, 'Toyota', 'Corolla', 2022, 'Gasolina');
    expect(vehiculo.getPlaca().getValue()).toBe('PBA-1234');
    expect(vehiculo.getMarca()).toBe('Toyota');
    expect(vehiculo.getModelo()).toBe('Corolla');
    expect(vehiculo.getAnio()).toBe(2022);
    expect(vehiculo.getTipoMotor()).toBe('Gasolina');
    expect(vehiculo.getTasaDesgasteActual().getPorcentaje()).toBe(0);
  });

  it('debe lanzar error si faltan datos basicos obligatorios', () => {
    expect(() => new Vehiculo(placa, '', 'Corolla', 2022, 'Gasolina')).toThrow('Marca, modelo y tipo de motor son requeridos');
    expect(() => new Vehiculo(placa, 'Toyota', '', 2022, 'Gasolina')).toThrow('Marca, modelo y tipo de motor son requeridos');
    expect(() => new Vehiculo(placa, 'Toyota', 'Corolla', 2022, '')).toThrow('Marca, modelo y tipo de motor son requeridos');
  });

  it('debe lanzar error si el año es menor a 1886 o excesivamente futurista', () => {
    const anioInvalidoFuturo = new Date().getFullYear() + 2;
    expect(() => new Vehiculo(placa, 'Toyota', 'Corolla', 1800, 'Gasolina')).toThrow('Año de vehículo inválido');
    expect(() => new Vehiculo(placa, 'Toyota', 'Corolla', anioInvalidoFuturo, 'Gasolina')).toThrow('Año de vehículo inválido');
  });

  it('debe registrar el ingreso de kilometraje cronologicamente', () => {
    const vehiculo = new Vehiculo(placa, 'Toyota', 'Corolla', 2022, 'Gasolina');
    const fechaBase = new Date('2026-01-01');
    
    vehiculo.registrarIngresoKilometraje(10000, fechaBase);
    expect(vehiculo.getRegistrosKilometraje().length).toBe(1);
    expect(vehiculo.getRegistrosKilometraje()[0].getValorKm()).toBe(10000);

    const fechaPosterior = new Date('2026-01-02');
    vehiculo.registrarIngresoKilometraje(10500, fechaPosterior);
    expect(vehiculo.getRegistrosKilometraje()[1].getValorKm()).toBe(10500);
  });

  it('debe lanzar error si el kilometraje ingresado retrocede', () => {
    const vehiculo = new Vehiculo(placa, 'Toyota', 'Corolla', 2022, 'Gasolina');
    vehiculo.registrarIngresoKilometraje(20000);
    expect(() => vehiculo.registrarIngresoKilometraje(19999)).toThrow(
      'El nuevo kilometraje no puede ser menor al registro anterior'
    );
  });

  it('debe lanzar error si la fecha del nuevo evento es cronologicamente anterior al ultimo', () => {
    const vehiculo = new Vehiculo(placa, 'Toyota', 'Corolla', 2022, 'Gasolina');
    vehiculo.registrarIngresoKilometraje(10000, new Date('2026-05-10'));
    
    expect(() => vehiculo.registrarIngresoKilometraje(11000, new Date('2026-05-09'))).toThrow(
      'Inconsistencia cronológica'
    );
  });

  it('debe gestionar el ciclo de vida de las intervenciones vinculadas', () => {
    const vehiculo = new Vehiculo(placa, 'Toyota', 'Corolla', 2022, 'Gasolina');
    const idIntervencion = new IntervencionId('INT-999');
    const intervencion = new Intervencion(
      idIntervencion,
      new MecanicoId('MEC-01'),
      new ClienteId('CLI-01'),
      new DiagnosticoTecnico('Cambio de pastillas de freno'),
      new Date('2026-06-01')
    );

    vehiculo.vincularNuevaIntervencion(intervencion);
    expect(vehiculo.getHistorialEvolutivo().length).toBe(1);

    const componente = new ComponenteCritico('Pastillas de Freno Delanteras');
    vehiculo.agregarComponenteAIntervencion(idIntervencion, componente);
    
    expect(() => vehiculo.finalizarIntervencion(idIntervencion)).not.toThrow();
  });

  it('debe lanzar error al intentar modificar una intervencion inexistente', () => {
    const vehiculo = new Vehiculo(placa, 'Toyota', 'Corolla', 2022, 'Gasolina');
    const idFalso = new IntervencionId('INT-404');
    const componente = new ComponenteCritico('Filtro de Aire');

    expect(() => vehiculo.agregarComponenteAIntervencion(idFalso, componente)).toThrow(
      'Intervención no encontrada en el historial'
    );
    expect(() => vehiculo.finalizarIntervencion(idFalso)).toThrow(
      'Intervención no encontrada en el historial'
    );
  });

  it('debe recalcular la tasa de desgaste semanal basada en los registros de kilometraje', () => {
    const vehiculo = new Vehiculo(placa, 'Toyota', 'Corolla', 2022, 'Gasolina');
    vehiculo.recalcularTasaDesgasteSemanal();
    expect(vehiculo.getTasaDesgasteActual().getPorcentaje()).toBe(0);

    vehiculo.registrarIngresoKilometraje(5000);
    vehiculo.recalcularTasaDesgasteSemanal();
    expect(vehiculo.getTasaDesgasteActual().getPorcentaje()).toBe(0.5);
  });
});
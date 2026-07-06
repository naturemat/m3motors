import { ServicioPrediccionLLM } from '../../../src/domain/services/ServicioPrediccionLLM';

describe('Servicio de Dominio: ServicioPrediccionLLM', () => {
    let servicio: ServicioPrediccionLLM;

    beforeEach(() => {
        servicio = new ServicioPrediccionLLM();
    });

    test('Debería retornar alertas predictivas tipo mock basadas en los componentes enviados', () => {
        const componentes = [
            { id: 'comp-1', nombre: 'Pastillas de freno', limiteKm: 20000 }
        ];

        const alertas = servicio.predecirFallas(18000, 80, componentes);

        expect(alertas.length).toBe(1);
        expect(alertas[0].componenteId).toBe('comp-1');
        expect(alertas[0].nivelRiesgo).toBe('CRÍTICO');
        expect(alertas[0].diasRestantesEstimados).toBe(7);
    });

    test('Debería retornar riesgo BAJO si el kilometraje y desgaste son mínimos', () => {
        const componentes = [
            { id: 'comp-2', nombre: 'Banda de distribución', limiteKm: 60000 }
        ];

        const alertas = servicio.predecirFallas(5000, 10, componentes);

        expect(alertas[0].nivelRiesgo).toBe('BAJO');
        expect(alertas[0].diasRestantesEstimados).toBe(180);
    });
});
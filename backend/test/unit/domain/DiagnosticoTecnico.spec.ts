import { DiagnosticoTecnico } from '../../../src/domain/value-objects/DiagnosticoTecnico';

describe('Objeto de Valor: DiagnosticoTecnico', () => {

    test('Debería crear una instancia exitosamente con una descripción válida', () => {
        const descripcionValida = "Falla en el sistema de frenos por desgaste de pastillas.";
        const diagnostico = new DiagnosticoTecnico(descripcionValida);
        
        expect(diagnostico.getDescripcion()).toBe(descripcionValida);
    });

    test('Debería lanzar un error si el diagnóstico es una cadena vacía', () => {
        expect(() => new DiagnosticoTecnico("")).toThrow('El diagnóstico no puede estar vacío');
    });

    test('Debería lanzar un error si el diagnóstico solo contiene espacios en blanco', () => {
        expect(() => new DiagnosticoTecnico("   ")).toThrow('El diagnóstico no puede estar vacío');
    });
});
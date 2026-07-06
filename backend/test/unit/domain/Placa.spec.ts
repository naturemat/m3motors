import { Placa } from '../../../src/domain/value-objects/Placa';

describe('Objeto de Valor: Placa', () => {
    
    test('Debería crear una instancia exitosamente con un formato válido', () => {
        const placa = new Placa("ABC-1234");
        expect(placa.getValue()).toBe("ABC-1234");

        const placaTresDigitos = new Placa("ABC-123");
        expect(placaTresDigitos.getValue()).toBe("ABC-123");
    });

    test('Debería lanzar un error si el formato es inválido', () => {
        // Formatos que violan la expresión regular /^[A-Z]{3}-\d{3,4}$/
        expect(() => new Placa("AB-1234")).toThrow('Placa inválida.'); 
        expect(() => new Placa("ABC1234")).toThrow('Placa inválida.'); // Le falta el guion
        expect(() => new Placa("ABC-12")).toThrow('Placa inválida.');
    });
});
export class Placa {
  private readonly value: string;
  constructor(value: string) {
    if (!/^[A-Z]{3}-\d{3,4}$/.test(value)) {
      throw new Error('Placa inválida. Formato esperado: ABC-123 o ABC-1234');
    }
    this.value = value;
  }
  getValue(): string { return this.value; }
}
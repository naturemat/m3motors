export class Placa {
  private readonly value: string;

  constructor(value: string) {
    const limpio = value.replace(/\s/g, '').toUpperCase();

    if (!/^[A-Z]{3}-?\d{3,4}$/.test(limpio)) {
      throw new Error('Placa inválida. Formato esperado: ABC-1234 o ABC1234');
    }

    this.value = limpio;
  }

  getValue(): string {
    return this.value;
  }

  getValueSinGuion(): string {
    return this.value.replace('-', '');
  }

  getValueConGuion(): string {
    if (this.value.includes('-')) return this.value;
    return `${this.value.slice(0, 3)}-${this.value.slice(3)}`;
  }

  equals(other: Placa): boolean {
    return this.value === other.value;
  }
}

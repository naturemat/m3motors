export class PhoneNumber {
  private readonly value: string;

  constructor(value: string) {
    const limpio = value.replace(/\s/g, '');

    if (!/^\+?\d{10,13}$/.test(limpio)) {
      throw new Error(
        'Número telefónico inválido. Formato esperado: +593XXXXXXXXX o 09XXXXXXXX',
      );
    }

    if (limpio.startsWith('+593') && limpio.length !== 13) {
      throw new Error(
        'Número ecuatoriano inválido. Formato: +593 seguido de 9 dígitos',
      );
    }

    if (!limpio.startsWith('+') && !limpio.startsWith('0')) {
      throw new Error(
        'El número debe empezar con + (internacional) o 0 (local)',
      );
    }

    this.value = limpio;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }
}

export class PhoneNumber {
  private readonly value: string;

  constructor(value: string) {
    const limpio = value.replace(/\s/g, '');
    if (!/^\+?\d{10,13}$/.test(limpio)) {
      throw new Error(
        'Número telefónico inválido. Formato esperado: +593XXXXXXXXX o 09XXXXXXXX',
      );
    }
    this.value = limpio;
  }

  getValue(): string {
    return this.value;
  }
}

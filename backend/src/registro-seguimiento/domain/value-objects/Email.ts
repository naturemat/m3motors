export class Email {
  private readonly value: string;

  constructor(value: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('Correo electrónico inválido');
    }
    this.value = value.toLowerCase();
  }

  getValue(): string {
    return this.value;
  }
}

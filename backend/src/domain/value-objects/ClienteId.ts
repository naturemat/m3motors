export class ClienteId {
  private readonly value: string;
  constructor(value: string) {
    if (!value || value.trim().length === 0) throw new Error('ClienteId no puede estar vacío');
    this.value = value;
  }
  getValue(): string { return this.value; }
}
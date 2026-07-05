export class MecanicoId {
  private readonly value: string;
  constructor(value: string) {
    if (!value || value.trim().length === 0)
      throw new Error('MecanicoId no puede estar vacío');
    this.value = value;
  }
  getValue(): string {
    return this.value;
  }
}

export class DiagnosticoTecnico {
  constructor(private readonly descripcion: string) {
    if (!descripcion || descripcion.trim() === '')
      throw new Error('El diagnóstico no puede estar vacío');
  }
  getDescripcion(): string {
    return this.descripcion;
  }
}

export interface EngineSpecs {
  cilindrada: string;
  cilindros: string;
  distribucion: string;
}

export interface IEngineInfoService {
  obtenerSpecsMotor(
    marca: string,
    modelo: string,
    anio: number,
  ): Promise<EngineSpecs>;
}

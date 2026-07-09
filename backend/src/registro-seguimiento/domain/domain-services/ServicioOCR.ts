import { Placa } from '../../../shared/domain/value-objects/Placa';

export interface ServicioOCR {
  reconocerPlaca(imagenBuffer: Buffer, mimeType: string): Promise<Placa>;
}

export interface IOCRService {
  reconocerPlaca(imagenBuffer: Buffer, mimeType: string): Promise<string>;
}

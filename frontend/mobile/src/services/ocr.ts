import api from './api';

export interface OCRResult {
  placa: string;
  confidence: number;
}

export async function recognizePlate(base64Image: string): Promise<OCRResult> {
  const response = await api.post<OCRResult>('/ocr/recognize-plate', {
    image: base64Image,
  });
  return response.data;
}

export function validateEcuadorianPlate(plate: string): boolean {
  const cleaned = plate.replace(/[\s-]/g, '').toUpperCase();
  return /^[A-Z]{3}\d{4}$/.test(cleaned) || /^[A-Z]{3}-\d{4}$/.test(cleaned);
}

export function formatPlateDisplay(plate: string): string {
  const cleaned = plate.replace(/[\s-]/g, '').toUpperCase();
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return cleaned;
}

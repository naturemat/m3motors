import { Injectable, Logger } from '@nestjs/common';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private supabaseUrl: string;
  private supabaseKey: string;
  private bucketName: string;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL ?? '';
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    this.bucketName = process.env.SUPABASE_STORAGE_BUCKET ?? 'm3motors-photos';
  }

  /**
   * Validate MIME type is an allowed image format
   */
  validateMimeType(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase());
  }

  /**
   * Validate file size is within limits
   */
  validateFileSize(sizeInBytes: number): boolean {
    return sizeInBytes <= MAX_FILE_SIZE;
  }

  /**
   * Upload a base64 image to Supabase Storage
   * @param base64Data - Base64 encoded image (with or without data:image prefix)
   * @param mimeType - MIME type of the image
   * @param folder - Storage folder (e.g., 'interventions', 'vehicles', 'activation')
   * @param fileName - Optional custom filename
   * @returns Public URL of the uploaded file
   */
  async uploadImage(
    base64Data: string,
    mimeType: string,
    folder: string,
    fileName?: string,
  ): Promise<string> {
    // Validate MIME type
    if (!this.validateMimeType(mimeType)) {
      throw new Error(
        `Tipo de archivo no permitido: ${mimeType}. Solo se permiten: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // Remove data:image prefix if present
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to buffer
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Validate file size
    if (!this.validateFileSize(buffer.length)) {
      throw new Error(
        `Archivo demasiado grande: ${(buffer.length / 1024 / 1024).toFixed(2)}MB. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    // Generate filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = this.getExtensionFromMime(mimeType);
    const finalName = fileName ?? `${timestamp}-${random}.${ext}`;
    const filePath = `${folder}/${finalName}`;

    // Upload to Supabase Storage
    const url = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filePath}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
        Authorization: `Bearer ${this.supabaseKey}`,
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Error uploading to Supabase: ${error}`);
      throw new Error(`Error subiendo archivo: ${response.statusText}`);
    }

    // Return public URL
    const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucketName}/${filePath}`;
    this.logger.log(`File uploaded: ${filePath}`);

    return publicUrl;
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(filePath: string): Promise<void> {
    const url = `${this.supabaseUrl}/storage/v1/object/${this.bucketName}/${filePath}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.supabaseKey}`,
      },
    });

    if (!response.ok) {
      this.logger.warn(`Error deleting file: ${filePath}`);
    }
  }

  private getExtensionFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
      'image/heif': 'heif',
    };
    return map[mimeType.toLowerCase()] ?? 'jpg';
  }
}

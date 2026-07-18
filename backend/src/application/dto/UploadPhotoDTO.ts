import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadPhotoDTO {
  @ApiProperty({ description: 'Foto en base64 (con o sin prefijo data:image)' })
  @IsString()
  @IsNotEmpty()
  fotoBase64!: string;

  @ApiProperty({ example: 'image/jpeg', description: 'MIME type de la imagen' })
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiPropertyOptional({ example: 'VEHICLE', description: 'Tipo de foto: VEHICLE, INTERVENTION, ACTIVATION' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ example: 'Placa delantera visible' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

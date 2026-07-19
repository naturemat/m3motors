import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsIn,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDetalleDTO {
  @ApiProperty({ example: 'Filtro de aceite' })
  @IsString()
  componenteReemplazado!: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  kilometrajeInstalacion!: number;

  @ApiProperty({ example: 60000 })
  @IsNumber()
  limiteKilometraje!: number;

  @ApiProperty({ example: 'Mantenimiento preventivo' })
  @IsString()
  tipoServicio!: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del repuesto del catálogo',
  })
  @IsOptional()
  @IsNumber()
  partsCatalogId?: number;

  @ApiPropertyOptional({ example: 'Bosch' })
  @IsOptional()
  @IsString()
  marcaRepuesto?: string;

  @ApiPropertyOptional({
    example: 'ORIGINAL',
    enum: ['ORIGINAL', 'ALTERNATIVO', 'REACONDICIONADO'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ORIGINAL', 'ALTERNATIVO', 'REACONDICIONADO'])
  calidadRepuesto?: string;

  @ApiPropertyOptional({ example: 'Sin observaciones' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    example: 365,
    description: 'Vida útil estimada en días',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vidaUtilDiasEstimada?: number;
}

export class InterventionPhotoDTO {
  @ApiProperty({
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
    description: 'Foto en base64 (con o sin prefijo data:image)',
  })
  @IsString()
  base64!: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type de la imagen',
  })
  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
  mimeType!: string;

  @ApiProperty({
    example: 'ANTES',
    enum: ['ANTES', 'DURANTE', 'DESPUES', 'DETALLE'],
    description: 'Momento de la foto en la intervención',
  })
  @IsString()
  @IsIn(['ANTES', 'DURANTE', 'DESPUES', 'DETALLE'])
  tipo!: string;

  @ApiPropertyOptional({ example: 'Estado inicial del filtro de aceite' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;
}

export class CreateInterventionDTO {
  @ApiProperty({ example: 1, description: 'ID del vehículo' })
  @IsNumber()
  vehiculoId!: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del mecánico (se obtiene del JWT)' })
  @IsOptional()
  @IsNumber()
  mecanicoId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del servicio del catálogo',
  })
  @IsOptional()
  @IsNumber()
  serviceCatalogId?: number;

  @ApiProperty({
    example: 150000,
    description: 'Kilometraje actual del odómetro',
  })
  @IsNumber()
  @Min(0)
  kilometrajeOdometro!: number;

  @ApiPropertyOptional({ example: 'Cambio de aceite y filtro' })
  @IsOptional()
  @IsString()
  diagnostico?: string;

  @ApiPropertyOptional({ example: 'Cliente solicitó revisión general' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ example: 'MEDIA', enum: ['BAJA', 'MEDIA', 'ALTA'] })
  @IsOptional()
  @IsString()
  severidad?: string;

  @ApiPropertyOptional({ example: 80.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  manoDeObra?: number;

  @ApiPropertyOptional({
    example: 'PREVENTIVO',
    enum: ['PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO'],
    description: 'Tipo de intervención',
  })
  @IsOptional()
  @IsString()
  @IsIn(['PREVENTIVO', 'CORRECTIVO', 'PREDICTIVO', 'DIAGNOSTICO'])
  tipoIntervencion?: string;

  @ApiPropertyOptional({ type: [CreateDetalleDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleDTO)
  detalles?: CreateDetalleDTO[];

  @ApiPropertyOptional({
    type: [InterventionPhotoDTO],
    description: 'Fotos de la intervención (máx. 10)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterventionPhotoDTO)
  fotos?: InterventionPhotoDTO[];
}

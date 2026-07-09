import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
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
}

export class CreateInterventionDTO {
  @ApiProperty({ example: 1, description: 'ID del vehículo' })
  @IsNumber()
  vehiculoId!: number;

  @ApiProperty({ example: 1, description: 'ID del mecánico' })
  @IsNumber()
  mecanicoId!: number;

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

  @ApiPropertyOptional({ type: [CreateDetalleDTO] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleDTO)
  detalles?: CreateDetalleDTO[];
}

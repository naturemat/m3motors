import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateServiceDTO {
  @ApiProperty({
    example: 'Cambio de aceite',
    description: 'Nombre del servicio ofrecido',
  })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiPropertyOptional({
    example: 'Servicio de cambio de aceite y filtros',
    description: 'Descripción detallada del servicio',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    example: 45,
    description: 'Precio de referencia del servicio',
  })
  @IsNumber()
  @Min(0)
  precioReferencia!: number;

  @ApiPropertyOptional({
    example: 'Mantenimiento',
    description: 'Categoría del servicio',
  })
  @IsOptional()
  @IsString()
  categoria?: string;
}

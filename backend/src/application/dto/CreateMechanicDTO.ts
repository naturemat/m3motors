import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator'

export class CreateMechanicDTO {
  @ApiProperty({ example: 'Luis Martínez', description: 'Nombre completo del mecánico' })
  @IsString()
  @IsNotEmpty()
  nombre!: string

  @ApiPropertyOptional({ example: 'Frenos', description: 'Especialidad del mecánico' })
  @IsOptional()
  @IsString()
  especialidad?: string

  @ApiPropertyOptional({ example: 4.5, description: 'Calificación promedio del mecánico' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rating?: number
}

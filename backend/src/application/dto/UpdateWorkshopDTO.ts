import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UpdateWorkshopDTO {
  @ApiPropertyOptional({ example: 'Taller M3', description: 'Nombre del taller' })
  @IsOptional()
  @IsString()
  nombre?: string

  @ApiPropertyOptional({ example: 'Av. Principal 123', description: 'Dirección del taller' })
  @IsOptional()
  @IsString()
  direccion?: string

  @ApiPropertyOptional({ example: '08:00 - 18:00', description: 'Horario del taller' })
  @IsOptional()
  @IsString()
  horarios?: string
}

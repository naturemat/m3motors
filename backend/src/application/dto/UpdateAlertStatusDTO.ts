import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAlertStatusDTO {
  @ApiProperty({
    example: 'CONFIRMADA',
    enum: ['GENERADA', 'NOTIFICADA', 'CONFIRMADA', 'CANCELADA'],
  })
  @IsString()
  @IsIn(['GENERADA', 'NOTIFICADA', 'CONFIRMADA', 'CANCELADA'])
  estadoAlerta!: string;

  @ApiPropertyOptional({ example: 'Cliente confirmó cita para el viernes' })
  @IsOptional()
  @IsString()
  comentario?: string;
}

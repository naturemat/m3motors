import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVehicleDTO {
  @ApiProperty({ example: 'ABC-1234', description: 'Placa del vehículo' })
  @IsString()
  placa!: string;

  @ApiProperty({ example: 'Toyota', description: 'Marca del vehículo' })
  @IsString()
  marca!: string;

  @ApiProperty({ example: 'Corolla', description: 'Modelo del vehículo' })
  @IsString()
  modelo!: string;

  @ApiProperty({ example: 2020, description: 'Año de fabricación' })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio!: number;

  @ApiPropertyOptional({ example: 'Gasolina', description: 'Tipo de motor' })
  @IsOptional()
  @IsString()
  tipoMotor?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del cliente propietario',
  })
  @IsOptional()
  @IsNumber()
  clienteId?: number;
}

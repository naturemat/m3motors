import {
  IsString,
  IsNumber,
  IsArray,
  IsBase64,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class VehiclePhotoDTO {
  @ApiProperty({
    example: 'frontal',
    description: 'Tipo de foto: frontal, lateral o placa',
    enum: ['frontal', 'lateral', 'placa'],
  })
  @IsString()
  tipo!: string;

  @ApiProperty({
    example: 'data:image/jpeg;base64,/9j/4AAQ...',
    description: 'Foto en base64',
  })
  @IsBase64()
  base64!: string;
}

export class ActivateClientDTO {
  @ApiProperty({
    example: '1',
    description: 'ID del cliente pre-registrado',
  })
  @IsString()
  customerId!: string;

  @ApiProperty({
    example: 'ws-001',
    description: 'ID del taller',
  })
  @IsString()
  workshopId!: string;

  @ApiProperty({
    example: 'Toyota',
    description: 'Marca del vehiculo',
  })
  @IsString()
  marca!: string;

  @ApiProperty({
    example: 'Corolla',
    description: 'Modelo del vehiculo',
  })
  @IsString()
  modelo!: string;

  @ApiProperty({
    example: 2020,
    description: 'Anio de fabricacion',
  })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio!: number;

  @ApiProperty({
    example: 'Gasolina',
    description: 'Tipo de motor',
    enum: ['Gasolina', 'Diesel', 'Hibrido', 'Electrico'],
  })
  @IsString()
  tipoMotor!: string;

  @ApiProperty({
    type: [VehiclePhotoDTO],
    description: 'Fotos del vehiculo (frontal, lateral, placa)',
  })
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => VehiclePhotoDTO)
  fotos!: VehiclePhotoDTO[];
}

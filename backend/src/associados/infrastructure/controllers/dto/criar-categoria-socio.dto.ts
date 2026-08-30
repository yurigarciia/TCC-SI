import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class CriarCategoriaSocioDto {
  @ApiProperty({ example: 'Contribuinte' })
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  @IsPositive()
  valorMensalidade: number;
}

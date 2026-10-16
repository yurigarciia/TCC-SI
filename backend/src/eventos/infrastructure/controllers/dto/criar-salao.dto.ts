import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CriarSalaoDto {
  @ApiProperty({ example: 'Salão Principal' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nome: string;

  @ApiProperty({ example: 200 })
  @IsInt()
  @IsPositive()
  capacidadeTotal: number;
}

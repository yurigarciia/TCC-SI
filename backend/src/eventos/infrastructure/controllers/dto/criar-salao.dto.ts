import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, MinLength } from 'class-validator';

export class CriarSalaoDto {
  @ApiProperty({ example: 'Salão Principal' })
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty({ example: 200 })
  @IsInt()
  @IsPositive()
  capacidadeTotal: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, MinLength } from 'class-validator';

export class CriarSalaoDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  capacidadeTotal: number;
}

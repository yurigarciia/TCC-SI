import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Min } from 'class-validator';

export class AdicionarMesaDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  numero: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  capacidade: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  posicaoX: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  posicaoY: number;
}

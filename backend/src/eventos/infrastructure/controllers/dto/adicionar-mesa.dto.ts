import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, Min } from 'class-validator';

export class AdicionarMesaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  numero: number;

  @ApiProperty({ example: 8 })
  @IsInt()
  @IsPositive()
  capacidade: number;

  @ApiProperty({ example: 120 })
  @IsInt()
  @Min(0)
  posicaoX: number;

  @ApiProperty({ example: 80 })
  @IsInt()
  @Min(0)
  posicaoY: number;
}

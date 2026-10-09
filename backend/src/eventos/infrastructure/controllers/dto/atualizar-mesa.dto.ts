import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { FormatoMesa } from '../../../domain/mesa.entity';

export class AtualizarMesaDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  numero?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  capacidade?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @IsInt()
  @Min(0)
  posicaoX?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsInt()
  @Min(0)
  posicaoY?: number;

  @ApiPropertyOptional({ enum: FormatoMesa, example: FormatoMesa.REDONDA })
  @IsOptional()
  @IsEnum(FormatoMesa)
  formato?: FormatoMesa;
}

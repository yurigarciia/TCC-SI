import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive, Min } from 'class-validator';
import { FormatoMesa } from '../../../domain/mesa.entity';

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

  @ApiPropertyOptional({
    enum: FormatoMesa,
    example: FormatoMesa.REDONDA,
    description: 'Padrão: redonda',
  })
  @IsOptional()
  @IsEnum(FormatoMesa)
  formato?: FormatoMesa;
}

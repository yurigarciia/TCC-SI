import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class AtualizarCategoriaSocioDto {
  @ApiPropertyOptional({ example: 'Contribuinte' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @ApiPropertyOptional({
    description:
      'Categoria isenta de mensalidade — quando true, valorMensalidade é ignorado (fica 0).',
  })
  @IsOptional()
  @IsBoolean()
  isenta?: boolean;

  @ApiPropertyOptional({ example: 45.5 })
  @ValidateIf((dto: AtualizarCategoriaSocioDto) => dto.isenta !== true)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorMensalidade?: number;
}

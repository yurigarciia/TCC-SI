import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CriarCategoriaSocioDto {
  @ApiProperty({ example: 'Contribuinte' })
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiPropertyOptional({
    description:
      'Categoria isenta de mensalidade (ex.: benemérito, honorário) — quando true, valorMensalidade é ignorado (fica 0).',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isenta?: boolean;

  @ApiPropertyOptional({
    example: 45.5,
    description: 'Obrigatório e deve ser positivo quando isenta não é true.',
  })
  @ValidateIf((dto: CriarCategoriaSocioDto) => !dto.isenta)
  @IsNumber()
  @IsPositive()
  valorMensalidade?: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AtualizarEventoDto {
  @ApiPropertyOptional({ example: 'Baile de Aniversário — CTG Pia do Sul' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome?: string;

  // Sem @IsNotPastDate aqui de propósito — diferente da criação, editar um evento que já
  // aconteceu (corrigir local/descrição depois do fato) é um caso de uso legítimo.
  @ApiPropertyOptional({ example: '2026-09-20T20:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  data?: string;

  @ApiPropertyOptional({ example: 'Sede social — CTG Pia do Sul' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  local?: string;

  @ApiPropertyOptional({ example: 'Baile tradicionalista com banda ao vivo' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  @ApiPropertyOptional({ example: 'b6f1e4d0-2c3a-4e9d-9f7e-1a2b3c4d5e6f' })
  @IsOptional()
  @IsUUID()
  salaoId?: string;
}

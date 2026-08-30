import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CriarEventoDto {
  @ApiProperty({ example: 'Baile de Aniversário — CTG Pia do Sul' })
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty({ example: '2026-09-20T20:00:00.000Z' })
  @IsDateString()
  data: string;

  @ApiProperty({ example: 'Sede social — CTG Pia do Sul' })
  @IsString()
  @MinLength(2)
  local: string;

  @ApiPropertyOptional({ example: 'Baile tradicionalista com banda ao vivo' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: 'b6f1e4d0-2c3a-4e9d-9f7e-1a2b3c4d5e6f' })
  @IsOptional()
  @IsUUID()
  salaoId?: string;
}

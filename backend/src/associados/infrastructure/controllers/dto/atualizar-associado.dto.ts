import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class AtualizarAssociadoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(3)
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  contato?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vinculoInstitucional?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoriaSocioId?: string;
}

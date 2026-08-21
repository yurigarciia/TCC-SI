import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CriarEventoDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty()
  @IsDateString()
  data: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  local: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  salaoId?: string;
}

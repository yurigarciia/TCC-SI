import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DependenteDto } from './dependente.dto';

export class CadastrarAssociadoMediadoDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty()
  @IsString()
  @MinLength(11)
  cpf: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  contato: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vinculoInstitucional?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoriaSocioId?: string;

  @ApiPropertyOptional({ type: [DependenteDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DependenteDto)
  dependentes?: DependenteDto[];
}

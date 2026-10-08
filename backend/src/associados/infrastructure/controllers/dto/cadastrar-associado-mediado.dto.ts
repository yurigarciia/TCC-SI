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
import { EnderecoDto } from './endereco.dto';

export class CadastrarAssociadoMediadoDto {
  @ApiProperty({ example: 'João Mediado' })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({ example: '22222222222' })
  @IsString()
  @MinLength(11)
  cpf: string;

  @ApiProperty({ example: '55999990003' })
  @IsString()
  @MinLength(8)
  contato: string;

  @ApiPropertyOptional({ example: 'Departamento de Danças' })
  @IsOptional()
  @IsString()
  vinculoInstitucional?: string;

  @ApiPropertyOptional({ example: 'b6f1e4d0-2c3a-4e9d-9f7e-1a2b3c4d5e6f' })
  @IsOptional()
  @IsUUID()
  categoriaSocioId?: string;

  @ApiProperty({ type: EnderecoDto })
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco: EnderecoDto;

  @ApiPropertyOptional({ type: [DependenteDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DependenteDto)
  dependentes?: DependenteDto[];
}

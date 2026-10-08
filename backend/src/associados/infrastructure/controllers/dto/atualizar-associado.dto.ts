import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { EnderecoDto } from './endereco.dto';

export class AtualizarAssociadoDto {
  @ApiPropertyOptional({ example: 'João Mediado' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  nome?: string;

  @ApiPropertyOptional({ example: '55999990003' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  contato?: string;

  @ApiPropertyOptional({ example: 'Departamento de Danças' })
  @IsOptional()
  @IsString()
  vinculoInstitucional?: string;

  @ApiPropertyOptional({ example: 'b6f1e4d0-2c3a-4e9d-9f7e-1a2b3c4d5e6f' })
  @IsOptional()
  @IsUUID()
  categoriaSocioId?: string;

  // Tudo ou nada de propósito: quando enviado, precisa vir completo (mesmo EnderecoDto do
  // cadastro) — evita um endereço meio preenchido salvo por engano numa edição parcial.
  @ApiPropertyOptional({ type: EnderecoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco?: EnderecoDto;
}

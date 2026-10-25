import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DependenteDto } from './dependente.dto';
import { EnderecoDto } from './endereco.dto';

export class CadastrarAssociadoMediadoDto {
  @ApiProperty({ example: 'João Mediado' })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  nome: string;

  @ApiProperty({ example: '22222222222' })
  @IsString()
  @MinLength(11)
  @MaxLength(14)
  cpf: string;

  // E-mail e telefone são ambos opcionais individualmente, mas precisa ter ao menos um dos dois
  // (@ValidateIf cruzado) — mesma garantia que o antigo "contato" único dava, sem forçar os dois.
  @ApiPropertyOptional({ example: 'joao@example.com' })
  @ValidateIf((o: CadastrarAssociadoMediadoDto) => !o.telefone)
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '55999990003' })
  @ValidateIf((o: CadastrarAssociadoMediadoDto) => !o.email)
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({ example: 'Departamento de Danças' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
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

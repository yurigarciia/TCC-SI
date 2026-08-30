import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class AutoCadastroAssociadoDto {
  @ApiProperty({ example: 'Maria Auto' })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({ example: '11111111111' })
  @IsString()
  @MinLength(11)
  cpf: string;

  @ApiProperty({ example: '55999990000' })
  @IsString()
  @MinLength(8)
  contato: string;

  @ApiPropertyOptional({ example: 'Departamento de Danças' })
  @IsOptional()
  @IsString()
  vinculoInstitucional?: string;

  @ApiProperty({ example: 'maria.auto@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  senha: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class AutoCadastroAssociadoDto {
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

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  senha: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class AtualizarUsuarioDto {
  @ApiPropertyOptional({ example: 'Maria da Silva' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @ApiPropertyOptional({ example: 'maria.silva@piadosul.org.br' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

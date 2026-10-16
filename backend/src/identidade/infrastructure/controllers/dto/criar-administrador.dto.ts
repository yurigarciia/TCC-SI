import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CriarAdministradorDto {
  @ApiProperty({ example: 'Maria da Silva' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome: string;

  @ApiProperty({ example: 'novo.diretor@piadosul.org.br' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'senhaProvisoria123' })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  senha: string;
}

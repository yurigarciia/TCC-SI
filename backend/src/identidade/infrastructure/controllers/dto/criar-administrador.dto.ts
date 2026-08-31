import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CriarAdministradorDto {
  @ApiProperty({ example: 'novo.diretor@piadosul.org.br' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senhaProvisoria123' })
  @IsString()
  @MinLength(6)
  senha: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'diretoria@piadosul.org.br' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mudar123' })
  @IsString()
  @MinLength(6)
  senha: string;
}

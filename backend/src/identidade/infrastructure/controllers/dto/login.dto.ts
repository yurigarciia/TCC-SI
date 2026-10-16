import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'diretoria@piadosul.org.br' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'mudar123' })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  senha: string;
}

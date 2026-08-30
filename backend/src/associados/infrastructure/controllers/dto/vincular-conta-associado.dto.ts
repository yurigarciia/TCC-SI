import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class VincularContaAssociadoDto {
  @ApiProperty({ example: '22222222222' })
  @IsString()
  @MinLength(11)
  cpf: string;

  @ApiProperty({ example: 'joao.mediado@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  senha: string;
}

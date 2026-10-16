import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class VincularContaAssociadoDto {
  @ApiProperty({ example: '22222222222' })
  @IsString()
  @MinLength(11)
  @MaxLength(14)
  cpf: string;

  @ApiProperty({ example: 'joao.mediado@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  senha: string;
}

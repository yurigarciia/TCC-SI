import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class VincularContaAssociadoDto {
  @ApiProperty()
  @IsString()
  @MinLength(11)
  cpf: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  senha: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AlterarSenhaDto {
  @ApiProperty({ example: 'senhaAtual123' })
  @IsString()
  @MaxLength(72)
  senhaAtual: string;

  @ApiProperty({ example: 'senhaNova456' })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  senhaNova: string;
}

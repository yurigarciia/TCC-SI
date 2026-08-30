import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, MinLength } from 'class-validator';

export class DependenteDto {
  @ApiProperty({ example: 'Filho do João' })
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty({ example: '2015-04-10' })
  @IsDateString()
  dataNascimento: string;
}

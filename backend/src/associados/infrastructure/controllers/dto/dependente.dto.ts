import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, MinLength } from 'class-validator';

export class DependenteDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nome: string;

  @ApiProperty()
  @IsDateString()
  dataNascimento: string;
}

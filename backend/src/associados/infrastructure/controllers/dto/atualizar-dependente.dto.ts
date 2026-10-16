import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class AtualizarDependenteDto {
  @ApiPropertyOptional({ example: 'Filho do João' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nome?: string;

  @ApiPropertyOptional({ example: '2015-04-10' })
  @IsOptional()
  @IsDateString()
  dataNascimento?: string;
}

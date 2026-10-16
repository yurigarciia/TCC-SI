import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsPlausibleBirthDate } from '../../../../shared/validators/date-validators';

export class AtualizarDependenteDto {
  @ApiPropertyOptional({ example: 'Filho do João' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome?: string;

  @ApiPropertyOptional({ example: '2015-04-10' })
  @IsOptional()
  @IsDateString()
  @IsPlausibleBirthDate()
  dataNascimento?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, MaxLength, MinLength } from 'class-validator';
import { IsPlausibleBirthDate } from '../../../../shared/validators/date-validators';

export class DependenteDto {
  @ApiProperty({ example: 'Filho do João' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome: string;

  @ApiProperty({ example: '2015-04-10' })
  @IsDateString()
  @IsPlausibleBirthDate()
  dataNascimento: string;
}

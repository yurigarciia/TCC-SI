import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class TransferirTitularDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  novoTitular: string;
}

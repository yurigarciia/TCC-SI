import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class TransferirTitularDto {
  @ApiProperty({ example: 'Maria Auto' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  novoTitular: string;
}

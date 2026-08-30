import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class TransferirTitularDto {
  @ApiProperty({ example: 'Maria Auto' })
  @IsString()
  @MinLength(2)
  novoTitular: string;
}

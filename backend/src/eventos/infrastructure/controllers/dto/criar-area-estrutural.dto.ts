import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, Min, MinLength } from 'class-validator';

export class CriarAreaEstruturalDto {
  @ApiProperty({ example: 'Tablado' })
  @IsString()
  @MinLength(1)
  nome: string;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(0)
  x: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(0)
  y: number;

  @ApiProperty({ example: 160 })
  @IsInt()
  @IsPositive()
  largura: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @IsPositive()
  altura: number;
}

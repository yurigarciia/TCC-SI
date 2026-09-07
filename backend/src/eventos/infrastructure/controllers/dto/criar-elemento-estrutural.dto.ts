import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min } from 'class-validator';
import { TipoElementoEstrutural } from '../../../domain/elemento-estrutural.entity';

export class CriarElementoEstruturalDto {
  @ApiProperty({ enum: TipoElementoEstrutural, example: TipoElementoEstrutural.PAREDE })
  @IsEnum(TipoElementoEstrutural)
  tipo: TipoElementoEstrutural;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(0)
  x1: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(0)
  y1: number;

  @ApiProperty({ example: 200 })
  @IsInt()
  @Min(0)
  x2: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(0)
  y2: number;
}

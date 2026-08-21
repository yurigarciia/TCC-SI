import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsPositive,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class ConfiguracaoMesaItemDto {
  @ApiProperty()
  @IsUUID()
  mesaId: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  preco: number;

  @ApiProperty()
  @IsBoolean()
  bloqueada: boolean;
}

export class ConfigurarMesasEventoDto {
  @ApiProperty({ type: [ConfiguracaoMesaItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ConfiguracaoMesaItemDto)
  mesas: ConfiguracaoMesaItemDto[];
}

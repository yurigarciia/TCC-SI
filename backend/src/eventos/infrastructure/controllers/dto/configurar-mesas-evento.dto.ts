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
  @ApiProperty({ example: 'b6f1e4d0-2c3a-4e9d-9f7e-1a2b3c4d5e6f' })
  @IsUUID()
  mesaId: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @IsPositive()
  preco: number;

  @ApiProperty({ example: false })
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

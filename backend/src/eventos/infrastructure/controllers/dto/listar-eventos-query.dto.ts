import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginacaoQueryDto } from '../../../../shared/pagination/paginacao-query.dto';
import { StatusEvento } from '../../../domain/evento.entity';

export class ListarEventosQueryDto extends PaginacaoQueryDto {
  @ApiPropertyOptional({ enum: StatusEvento, description: 'Filtra por status do evento' })
  @IsOptional()
  @IsEnum(StatusEvento)
  status?: StatusEvento;

  @ApiPropertyOptional({ description: 'Filtra eventos com data >= este valor (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({ description: 'Filtra eventos com data <= este valor (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}

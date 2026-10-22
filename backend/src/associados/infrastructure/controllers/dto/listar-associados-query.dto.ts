import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoQueryDto } from '../../../../shared/pagination/paginacao-query.dto';
import { StatusAssociado } from '../../../domain/associado.entity';

export class ListarAssociadosQueryDto extends PaginacaoQueryDto {
  @ApiPropertyOptional({ description: 'Filtra por categoria de sócio' })
  @IsOptional()
  @IsUUID()
  categoriaSocioId?: string;

  @ApiPropertyOptional({ enum: StatusAssociado, description: 'Filtra por status do associado' })
  @IsOptional()
  @IsEnum(StatusAssociado)
  status?: StatusAssociado;
}

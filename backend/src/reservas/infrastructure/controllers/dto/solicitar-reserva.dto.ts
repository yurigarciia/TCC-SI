import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import {
  CanalReserva,
  FormaPagamentoReserva,
} from '../../../domain/reserva.entity';

export class SolicitarReservaDto {
  @ApiProperty({ enum: CanalReserva })
  @IsEnum(CanalReserva)
  canal: CanalReserva;

  @ApiProperty({ enum: FormaPagamentoReserva })
  @IsEnum(FormaPagamentoReserva)
  formaPagamento: FormaPagamentoReserva;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  nomeTitular?: string;

  @ApiPropertyOptional({
    description: 'Vincula a reserva a um associado cadastrado (opcional).',
  })
  @IsOptional()
  @IsUUID()
  associadoId?: string;
}

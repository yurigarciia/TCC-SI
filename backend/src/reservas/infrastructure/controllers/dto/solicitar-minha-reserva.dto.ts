import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { FormaPagamentoReserva } from '../../../domain/reserva.entity';

export class SolicitarMinhaReservaDto {
  @ApiProperty({
    enum: FormaPagamentoReserva,
    example: FormaPagamentoReserva.ONLINE,
  })
  @IsEnum(FormaPagamentoReserva)
  formaPagamento: FormaPagamentoReserva;
}

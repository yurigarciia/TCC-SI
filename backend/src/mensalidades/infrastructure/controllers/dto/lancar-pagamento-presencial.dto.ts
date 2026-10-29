import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class LancarPagamentoPresencialDto {
  @ApiPropertyOptional({
    example: 100,
    description: 'Valor efetivamente pago. Default: valor da mensalidade.',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorPago?: number;

  @ApiPropertyOptional({
    example: '2026-10-29',
    description: 'Data em que o pagamento foi recebido. Default: hoje.',
  })
  @IsOptional()
  @IsDateString()
  dataPagamento?: string;
}

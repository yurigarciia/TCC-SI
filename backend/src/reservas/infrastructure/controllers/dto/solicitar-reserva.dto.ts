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
  @ApiProperty({ enum: CanalReserva, example: CanalReserva.MEDIADO })
  @IsEnum(CanalReserva)
  canal: CanalReserva;

  @ApiProperty({
    enum: FormaPagamentoReserva,
    example: FormaPagamentoReserva.PRESENCIAL,
  })
  @IsEnum(FormaPagamentoReserva)
  formaPagamento: FormaPagamentoReserva;

  @ApiPropertyOptional({ example: 'Sócio Teste' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nomeTitular?: string;

  @ApiPropertyOptional({
    description: 'Vincula a reserva a um associado cadastrado (opcional).',
    example: 'b6f1e4d0-2c3a-4e9d-9f7e-1a2b3c4d5e6f',
  })
  @IsOptional()
  @IsUUID()
  associadoId?: string;
}

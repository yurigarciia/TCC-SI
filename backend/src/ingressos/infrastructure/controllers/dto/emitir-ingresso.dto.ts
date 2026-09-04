import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import {
  CanalIngresso,
  FormaPagamentoIngresso,
  PerfilComprador,
} from '../../../domain/ingresso.entity';

export class EmitirIngressoDto {
  @ApiProperty({ example: 'Sócio Teste' })
  @IsString()
  @MinLength(2)
  nomeComprador: string;

  @ApiProperty({ enum: PerfilComprador, example: PerfilComprador.SOCIO })
  @IsEnum(PerfilComprador)
  perfilComprador: PerfilComprador;

  // Obrigatório quando perfilComprador = SOCIO (validado no use case — preço varia por
  // categoria); ignorado pros demais perfis.
  @ApiPropertyOptional({ example: 'b6f1e4d0-2c3a-4e9d-9f7e-1a2b3c4d5e6f' })
  @IsOptional()
  @IsUUID()
  categoriaSocioId?: string;

  @ApiProperty({ enum: CanalIngresso, example: CanalIngresso.MEDIADO })
  @IsEnum(CanalIngresso)
  canal: CanalIngresso;

  @ApiProperty({
    enum: FormaPagamentoIngresso,
    example: FormaPagamentoIngresso.PRESENCIAL,
  })
  @IsEnum(FormaPagamentoIngresso)
  formaPagamento: FormaPagamentoIngresso;
}

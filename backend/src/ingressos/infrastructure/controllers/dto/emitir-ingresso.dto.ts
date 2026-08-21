import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
import {
  CanalIngresso,
  FormaPagamentoIngresso,
  PerfilComprador,
} from '../../../domain/ingresso.entity';

export class EmitirIngressoDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  nomeComprador: string;

  @ApiProperty({ enum: PerfilComprador })
  @IsEnum(PerfilComprador)
  perfilComprador: PerfilComprador;

  @ApiProperty({ enum: CanalIngresso })
  @IsEnum(CanalIngresso)
  canal: CanalIngresso;

  @ApiProperty({ enum: FormaPagamentoIngresso })
  @IsEnum(FormaPagamentoIngresso)
  formaPagamento: FormaPagamentoIngresso;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MinLength } from 'class-validator';
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

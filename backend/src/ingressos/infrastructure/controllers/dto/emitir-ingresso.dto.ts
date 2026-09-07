import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
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

  // Sobrescreve o preço resolvido por perfil/categoria (padrão da entidade ou override do
  // evento) — pra vender por um valor diferente do configurado (desconto, cortesia parcial,
  // evento sem preço configurado ainda etc.). Achado numa conversa com o usuário: sem isso, um
  // evento sem preço configurado pra um perfil simplesmente não deixava vender ingresso nenhum
  // pra esse perfil, mesmo presencialmente.
  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preco?: number;
}

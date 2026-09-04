import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { PerfilComprador } from '../../../domain/ingresso.entity';

export class DefinirPrecoDto {
  @ApiProperty({ enum: PerfilComprador, example: PerfilComprador.SOCIO })
  @IsEnum(PerfilComprador)
  perfil: PerfilComprador;

  @ApiProperty({ example: 20.0 })
  @IsNumber()
  @IsPositive()
  preco: number;

  // Obrigatório quando perfil = SOCIO (validado no use case — preço de sócio varia por
  // categoria); ignorado pros demais perfis.
  @ApiPropertyOptional({ example: 'b6f1e4d0-2c3a-4e9d-9f7e-1a2b3c4d5e6f' })
  @IsOptional()
  @IsUUID()
  categoriaSocioId?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { PerfilComprador } from '../../../domain/ingresso.entity';

export class DefinirPrecoDto {
  @ApiProperty({ enum: PerfilComprador, example: PerfilComprador.SOCIO })
  @IsEnum(PerfilComprador)
  perfil: PerfilComprador;

  @ApiProperty({ example: 20.0 })
  @IsNumber()
  @IsPositive()
  preco: number;
}

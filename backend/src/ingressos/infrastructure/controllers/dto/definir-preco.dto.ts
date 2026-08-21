import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { PerfilComprador } from '../../../domain/ingresso.entity';

export class DefinirPrecoDto {
  @ApiProperty({ enum: PerfilComprador })
  @IsEnum(PerfilComprador)
  perfil: PerfilComprador;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  preco: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class ConfigurarIngressoEventoDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  quantidadeDisponivel: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  preco: number;
}

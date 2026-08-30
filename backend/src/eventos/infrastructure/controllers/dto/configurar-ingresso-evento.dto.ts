import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class ConfigurarIngressoEventoDto {
  @ApiProperty({ example: 200 })
  @IsInt()
  @Min(0)
  quantidadeDisponivel: number;

  @ApiProperty({ example: 35.0 })
  @IsNumber()
  @IsPositive()
  preco: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ConfigurarIngressoEventoDto {
  @ApiProperty({ example: 200 })
  @IsInt()
  @Min(0)
  quantidadeDisponivel: number;
}

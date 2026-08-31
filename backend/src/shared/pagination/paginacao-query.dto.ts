import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// Query params compartilhados por todo endpoint de listagem do painel — nenhum endpoint tinha
// paginação até esta ticket, listava tudo de uma vez (achado numa conversa com o usuário: uma
// entidade com mais sócios/eventos/ingressos ao longo dos anos cresceria mal sem isso).
export class PaginacaoQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Página (1-indexed)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number = 20;
}

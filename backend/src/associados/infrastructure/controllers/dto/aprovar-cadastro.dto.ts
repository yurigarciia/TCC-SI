import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AprovarCadastroDto {
  @ApiPropertyOptional({
    description:
      'Categoria de sócio a atribuir ao aprovar (auto-cadastro pelo app não coleta categoria) — opcional, pode ser definida depois na edição do associado',
    example: 'b6f1e4d0-2c3a-4e9d-9f7e-1a2b3c4d5e6f',
  })
  @IsOptional()
  @IsUUID()
  categoriaSocioId?: string;
}

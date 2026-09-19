import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IngressoRepositoryPort } from '../ports/ingresso-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { StatusIngresso } from '../../domain/ingresso.entity';

export interface IngressoDoAssociado {
  id: string;
  status: StatusIngresso;
  preco: number;
  usadoEm: string | null;
  evento: { id: string; nome: string; data: string; local: string } | null;
}

// RF13 (mesmo padrão de ListarMinhasReservasUseCase) — resolve o Associado a partir do Usuario
// autenticado e lista os ingressos vinculados a ele. Só existe vínculo pra ingressos comprados
// pelo próprio associado no app (ComprarMeuIngressoUseCase); ingresso vendido presencialmente
// pela diretoria pra visitante/criança sem cadastro continua sem associadoId, e não aparece
// aqui — não há "meu" pra alguém sem conta.
@Injectable()
export class ListarMeusIngressosUseCase {
  constructor(
    @Inject(IngressoRepositoryPort)
    private readonly ingressos: IngressoRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
  ) {}

  async execute(usuarioId: string): Promise<IngressoDoAssociado[]> {
    const associado = await this.associados.buscarPorUsuarioId(usuarioId);
    if (!associado) {
      throw new NotFoundException('Nenhum associado vinculado a este usuário');
    }

    const ingressos = await this.ingressos.listarPorAssociado(associado.id);

    return Promise.all(
      ingressos.map(async (ingresso) => {
        const evento = await this.eventos.buscarPorId(ingresso.eventoId);
        return {
          id: ingresso.id,
          status: ingresso.status,
          preco: ingresso.preco,
          usadoEm: ingresso.usadoEm?.toISOString() ?? null,
          evento: evento
            ? {
                id: evento.id,
                nome: evento.nome,
                data: evento.data,
                local: evento.local,
              }
            : null,
        };
      }),
    );
  }
}

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IngressoRepositoryPort } from '../ports/ingresso-repository.port';
import { EventoRepositoryPort } from '../../../eventos/application/ports/evento-repository.port';
import { AssociadoRepositoryPort } from '../../../associados/application/ports/associado-repository.port';
import { CategoriaSocioRepositoryPort } from '../../../associados/application/ports/categoria-socio-repository.port';
import { PerfilComprador, StatusIngresso } from '../../domain/ingresso.entity';

export interface IngressoDetalhado {
  id: string;
  codigo: number;
  nomeComprador: string;
  perfilComprador: PerfilComprador;
  preco: number;
  status: StatusIngresso;
  usadoEm: string | null;
  evento: { id: string; nome: string } | null;
  categoriaSocioNome: string | null;
}

// Achado numa conversa com o usuário — leitura do QR no check-in mostrava direto "entrada
// validada" sem nenhuma tela de conferência antes. Esse use case monta os dados pra essa tela de
// conferência (RegistrarCheckinUseCase continua separado, só roda quando a diretoria confirma).
@Injectable()
export class ConsultarIngressoUseCase {
  constructor(
    @Inject(IngressoRepositoryPort)
    private readonly ingressos: IngressoRepositoryPort,
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(AssociadoRepositoryPort)
    private readonly associados: AssociadoRepositoryPort,
    @Inject(CategoriaSocioRepositoryPort)
    private readonly categorias: CategoriaSocioRepositoryPort,
  ) {}

  async execute(id: string): Promise<IngressoDetalhado> {
    const ingresso = await this.ingressos.buscarPorId(id);
    if (!ingresso) {
      throw new NotFoundException('Ingresso não encontrado');
    }

    const evento = await this.eventos.buscarPorId(ingresso.eventoId);

    let categoriaSocioNome: string | null = null;
    if (ingresso.associadoId) {
      const associado = await this.associados.buscarPorId(ingresso.associadoId);
      if (associado?.categoriaSocioId) {
        const categoria = await this.categorias.buscarPorId(associado.categoriaSocioId);
        categoriaSocioNome = categoria?.nome ?? null;
      }
    }

    return {
      id: ingresso.id,
      codigo: ingresso.codigo,
      nomeComprador: ingresso.nomeComprador,
      perfilComprador: ingresso.perfilComprador,
      preco: ingresso.preco,
      status: ingresso.status,
      usadoEm: ingresso.usadoEm?.toISOString() ?? null,
      evento: evento ? { id: evento.id, nome: evento.nome } : null,
      categoriaSocioNome,
    };
  }
}

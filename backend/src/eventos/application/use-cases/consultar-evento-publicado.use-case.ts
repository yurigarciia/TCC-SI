import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventoRepositoryPort } from '../ports/evento-repository.port';
import { ConfiguracaoMesaEventoRepositoryPort } from '../ports/configuracao-mesa-evento-repository.port';
import { ConfiguracaoIngressoEventoRepositoryPort } from '../ports/configuracao-ingresso-evento-repository.port';
import { StatusEvento } from '../../domain/evento.entity';
import { EventoDetalhado } from './consultar-evento.use-case';

// RF11/RF12/RF14 (lado associado, T-MOB-004) — mesma resposta de ConsultarEventoUseCase, mas
// pública (sem guard, mesmo padrão de GET /eventos/publicados) e só pra eventos já publicados —
// um rascunho não deve vazar preço/configuração antes da diretoria publicar. 404 (não 403) se o
// evento existir mas ainda for rascunho, pra não revelar a existência de um evento não publicado.
@Injectable()
export class ConsultarEventoPublicadoUseCase {
  constructor(
    @Inject(EventoRepositoryPort)
    private readonly eventos: EventoRepositoryPort,
    @Inject(ConfiguracaoMesaEventoRepositoryPort)
    private readonly configMesas: ConfiguracaoMesaEventoRepositoryPort,
    @Inject(ConfiguracaoIngressoEventoRepositoryPort)
    private readonly configIngresso: ConfiguracaoIngressoEventoRepositoryPort,
  ) {}

  async execute(id: string): Promise<EventoDetalhado> {
    const evento = await this.eventos.buscarPorId(id);
    if (!evento || evento.status !== StatusEvento.PUBLICADO) {
      throw new NotFoundException('Evento não encontrado');
    }
    const mesas = await this.configMesas.listarPorEvento(id);
    const ingresso = await this.configIngresso.buscarPorEvento(id);
    return { evento, mesas, ingresso };
  }
}

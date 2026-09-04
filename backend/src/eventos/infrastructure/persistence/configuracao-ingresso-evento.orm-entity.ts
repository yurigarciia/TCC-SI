import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('configuracoes_ingresso_evento')
export class ConfiguracaoIngressoEventoOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'evento_id', type: 'uuid', unique: true })
  eventoId: string;

  @Column({ name: 'quantidade_disponivel', type: 'int' })
  quantidadeDisponivel: number;
}

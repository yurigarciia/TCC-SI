import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('configuracoes_mesa_evento')
export class ConfiguracaoMesaEventoOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'evento_id', type: 'uuid' })
  eventoId: string;

  @Column({ name: 'mesa_id', type: 'uuid' })
  mesaId: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  preco: string;

  @Column({ default: false })
  bloqueada: boolean;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoElementoEstrutural } from '../../domain/elemento-estrutural.entity';

@Entity('elementos_estruturais')
export class ElementoEstruturalOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'salao_id', type: 'uuid' })
  salaoId: string;

  @Column({ type: 'varchar' })
  tipo: TipoElementoEstrutural;

  @Column({ type: 'int' })
  x1: number;

  @Column({ type: 'int' })
  y1: number;

  @Column({ type: 'int' })
  x2: number;

  @Column({ type: 'int' })
  y2: number;
}

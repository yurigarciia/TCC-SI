import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('areas_estruturais')
export class AreaEstruturalOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'salao_id', type: 'uuid' })
  salaoId: string;

  @Column({ type: 'varchar' })
  nome: string;

  @Column({ type: 'int' })
  x: number;

  @Column({ type: 'int' })
  y: number;

  @Column({ type: 'int' })
  largura: number;

  @Column({ type: 'int' })
  altura: number;
}

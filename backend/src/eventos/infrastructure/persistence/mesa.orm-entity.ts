import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FormatoMesa } from '../../domain/mesa.entity';

@Entity('mesas')
export class MesaOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'salao_id', type: 'uuid' })
  salaoId: string;

  @Column({ type: 'int' })
  numero: number;

  @Column({ type: 'int' })
  capacidade: number;

  @Column({ name: 'posicao_x', type: 'int' })
  posicaoX: number;

  @Column({ name: 'posicao_y', type: 'int' })
  posicaoY: number;

  @Column({ type: 'varchar', default: FormatoMesa.REDONDA })
  formato: FormatoMesa;
}

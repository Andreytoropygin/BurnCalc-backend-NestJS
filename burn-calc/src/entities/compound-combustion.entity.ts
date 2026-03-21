import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Combustion } from './combustion.entity';
import { Compound } from './compound.entity';


const numberTransformer = {
  to: (value: number) => value,
  from: (value: string | null) =>
    value !== null ? parseFloat(value) : null,
};

@Entity('Compound_combustions')
@Unique('uq_compound_combustion', ['combustionId', 'compoundId'])
export class CompoundCombustion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'combustion_id' })
  combustionId: number;

  @Column({ name: 'compound_id' })
  compoundId: number;

  @Column('text', { nullable: true })
  comment: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, transformer: numberTransformer })
  amount: number;

  @ManyToOne(() => Combustion, (combustion) => combustion.compoundCombustions)
  @JoinColumn({ name: 'combustion_id' })
  combustion: Combustion;

  @ManyToOne(() => Compound, (compound) => compound.compoundCombustions)
  @JoinColumn({ name: 'compound_id' })
  compound: Compound;
}
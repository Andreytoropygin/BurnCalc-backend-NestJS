import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CompoundCombustion } from './compound-combustion.entity';
import { Exclude } from 'class-transformer';

const numberTransformer = {
  to: (value: number) => value,
  from: (value: string | null) =>
    value !== null ? parseFloat(value) : null,
};

@Entity('Compounds')
export class Compound {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  title: string;

  @Column({ name: 'is_active', default: true })
  @Exclude()
  isActive: boolean;

  @Column({ name: 'image_url', type: 'varchar', length: 100, nullable: true })
  imageUrl?: string | null;

  @Column({ name: 'video_url', type: 'varchar', length: 100, nullable: true })
  videoUrl?: string | null;

  @Column({ length: 50, unique: true })
  formula: string;

  @Column({ length: 150})
  description: string;

  @Column({ name: 'specific_h2o_volume', type: 'numeric', precision: 10, scale: 4, transformer: numberTransformer })
  specificH2oVolume: number;

  @Column({ name: 'specific_co2_volume', type: 'numeric', precision: 10, scale: 4, transformer: numberTransformer })
  specificCo2Volume: number;

  @Column({ length: 50 })
  class: string;

  @OneToMany(() => CompoundCombustion, (cc) => cc.compound)
  @Exclude()
  compoundCombustions: CompoundCombustion[];
}
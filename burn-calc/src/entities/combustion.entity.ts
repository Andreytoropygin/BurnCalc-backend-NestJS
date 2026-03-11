import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RequestCombustion } from './request-combustion.entity';
import { Exclude } from 'class-transformer';

const numberTransformer = {
  to: (value: number) => value,
  from: (value: string | null) =>
    value !== null ? parseFloat(value) : null,
};

@Entity('Combustion')
export class Combustion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  title: string;

  @Exclude()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string | null;

  @Column({ name: 'video_url', type: 'varchar', length: 500, nullable: true })
  videoUrl?: string | null;

  @Column({ length: 50, unique: true })
  formula: string;

  @Column({ name: 'specific_h2o_volume', type: 'decimal', precision: 10, scale: 4, transformer: numberTransformer })
  specificH2oVolume: number;

  @Column({ name: 'specific_co2_volume', type: 'decimal', precision: 10, scale: 4, transformer: numberTransformer })
  specificCo2Volume: number;

  @Column({ length: 50 })
  class: string;

  @OneToMany(() => RequestCombustion, (rc) => rc.combustion)
  requestCombustions: RequestCombustion[];
}
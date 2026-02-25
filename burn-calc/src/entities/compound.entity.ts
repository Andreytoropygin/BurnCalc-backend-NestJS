import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RequestCompound } from './request-compound.entity';

@Entity('Compound')
export class Compound {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 50, name: 'image_file_name', nullable: true })
  imageFileName: string;

  @Column({ length: 50, name: 'video_file_name', nullable: true })
  videoFileName: string;

  @Column({ length: 50 })
  formula: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  molar_mass: number;

  @Column({ name: 'c_count' })
  cCount: number;

  @Column({ name: 'h_count' })
  hCount: number;

  @Column({ name: 'o_count', default: 0 })
  oCount: number;

  @Column({ length: 50})
  class: string;

  @OneToMany(() => RequestCompound, (rc) => rc.compound)
  requestCompounds: RequestCompound[];
}
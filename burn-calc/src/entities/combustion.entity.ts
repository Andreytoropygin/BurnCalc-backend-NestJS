import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RequestCombustion } from './request-combustion.entity';

@Entity('Combustion')
export class Combustion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  title: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 50, nullable: true })
  image_file_name: string;

  @Column({ length: 50, nullable: true })
  video_file_name: string;

  @Column({ length: 50, unique: true })
  formula: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  specific_h2o_volume: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  specific_co2_volume: number;

  @Column({ length: 50})
  class: string;

  @OneToMany(() => RequestCombustion, (rc) => rc.combustion)
  requestCombustions: RequestCombustion[];
}
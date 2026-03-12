import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { CompoundCombustion } from './compound-combustion.entity';


const numberTransformer = {
  to: (value: number) => value,
  from: (value: string | null) =>
    value !== null ? parseFloat(value) : null,
};


@Entity('Combustions')
export class Combustion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 20 })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'formed_at', type: 'timestamp', nullable: true })
  formedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'moderator_id', nullable: true })
  moderatorId: number;

  @Column('text', { name: 'sample_description', nullable: true })
  sampleDescription: string;

  @Column({ name: 'co2_volume', type: 'decimal', precision: 10, scale: 4, nullable: true, transformer: numberTransformer })
  co2Volume: number;

  @Column({ name: 'h2o_volume', type: 'decimal', precision: 10, scale: 4, nullable: true, transformer: numberTransformer })
  h2oVolume: number;

  // Связи
  @ManyToOne(() => User, (user) => user.combustions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderator_id' })
  moderator: User;

  @OneToMany(() => CompoundCombustion, (cc) => cc.combustion)
  compoundCombustions: CompoundCombustion[];
}
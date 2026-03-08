import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { RequestCombustion } from './request-combustion.entity';
import { Combustion } from './combustion.entity';

@Entity('Request')
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 20 })
  status: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'formed_at', type: 'timestamp', nullable: true })
  formedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'moderator_id', nullable: true })
  moderatorId: number;

  @Column({ name: 'sample_description', nullable: true })
  sampleDescription: string;

  @Column({ name: 'co2_volume', type: 'decimal', precision: 10, scale: 4, nullable: true })
  co2Volume: number;

  @Column({ name: 'h2o_volume', type: 'decimal', precision: 10, scale: 4, nullable: true })
  h2oVolume: number;

  // Связи
  @ManyToOne(() => User, (user) => user.requests, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'moderator_id' })
  moderator: User;

  @OneToMany(() => RequestCombustion, (rc) => rc.request)
  requestCombustions: RequestCombustion[];
}
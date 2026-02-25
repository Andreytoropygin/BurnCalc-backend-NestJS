import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { RequestStatus } from './request-status.entity';
import { RequestCompound } from './request-compound.entity';
import { Compound } from './compound.entity';

@Entity('Request')
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'status_id' })
  statusId: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'formed_at', type: 'timestamp', nullable: true })
  formedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'moderator_id', nullable: true })
  moderatorId: number;

  @Column({ name: 'sample_mass', type: 'decimal', precision: 10, scale: 4, nullable: true })
  sampleMass: number;

  @Column({ name: 'co2_volume', type: 'decimal', precision: 10, scale: 4, nullable: true })
  co2Volume: number;

  @Column({ name: 'h2o_volume', type: 'decimal', precision: 10, scale: 4, nullable: true })
  h2oVolume: number;

  @Column({ name: 'calculated_compound_id', nullable: true })
  calculatedCompoundId: number;

  // Связи
  @ManyToOne(() => User, (user) => user.requests, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => RequestStatus, (status) => status.requests, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'status_id' })
  status: RequestStatus;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'moderator_id' })
  moderator: User;

  @ManyToOne(() => Compound, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'calculated_compound_id' })
  calculatedCompound: Compound;

  @OneToMany(() => RequestCompound, (rc) => rc.request)
  requestCompounds: RequestCompound[];
}
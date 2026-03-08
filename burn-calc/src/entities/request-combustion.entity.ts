import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Request } from './request.entity';
import { Combustion } from './combustion.entity';

@Entity('Request_combustion')
@Unique('uq_request_combustion', ['requestId', 'combustionId'])
export class RequestCombustion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'request_id' })
  requestId: number;

  @Column({ name: 'combustion_id' })
  combustionId: number;

  @Column({ nullable: true })
  comment: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true})
  amount: number;

  @ManyToOne(() => Request, (request) => request.requestCombustions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ManyToOne(() => Combustion, (combustion) => combustion.requestCombustions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'combustion_id' })
  combustion: Combustion;
}
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Request } from './request.entity';
import { Compound } from './compound.entity';

@Entity('Request_compound')
export class RequestCompound {
  // Составной первичный ключ
  @PrimaryColumn({ name: 'request_id' })
  requestId: number;

  @PrimaryColumn({ name: 'compound_id' })
  compoundId: number;

  @Column({ default: 1 })
  priority: number;

  @ManyToOne(() => Request, (request) => request.requestCompounds, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ManyToOne(() => Compound, (compound) => compound.requestCompounds, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'compound_id' })
  compound: Compound;
}
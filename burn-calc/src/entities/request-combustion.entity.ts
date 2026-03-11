import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Request } from './request.entity';
import { Combustion } from './combustion.entity';
import { Exclude } from 'class-transformer';


const numberTransformer = {
  to: (value: number) => value,
  from: (value: string | null) =>
    value !== null ? parseFloat(value) : null,
};

@Entity('Request_combustion')
@Unique('uq_request_combustion', ['requestId', 'combustionId'])
export class RequestCombustion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'request_id' })
  requestId: number;

  @Column({ name: 'combustion_id' })
  combustionId: number;

  @Column('text', { nullable: true })
  comment: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true, transformer: numberTransformer })
  amount: number;

  @ManyToOne(() => Request, (request) => request.requestCombustions)
  @JoinColumn({ name: 'request_id' })
  request: Request;

  @ManyToOne(() => Combustion, (combustion) => combustion.requestCombustions)
  @JoinColumn({ name: 'combustion_id' })
  combustion: Combustion;
}
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Request } from './request.entity';

@Entity('Request_statuses')
export class RequestStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  name: string;

  @OneToMany(() => Request, (request) => request.status)
  requests: Request[];
}
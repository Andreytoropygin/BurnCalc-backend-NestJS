import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Request } from './request.entity';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 50 })
  password: string;

  @Column({ name: 'is_moderator' })
  isModerator: boolean;

  @OneToMany(() => Request, (request) => request.user)
  requests: Request[];

  @OneToMany(() => Request, (request) => request.moderator)
  moderatedRequests: Request[];
}
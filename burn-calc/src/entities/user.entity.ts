import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Request } from './request.entity';

@Entity('User') // Имя таблицы в БД точно как в SQL (с большой буквы, если создавали так)
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ name: 'password', length: 50 })
  password: string;

  @Column({ length: 20, default: 'user' })
  role: string;

  @OneToMany(() => Request, (request) => request.user)
  requests: Request[];
}
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Combustion } from './combustion.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 50 })
  password: string;

  @Column({ name: 'is_moderator' })
  isModerator: boolean;

  @OneToMany(() => Combustion, (combustion) => combustion.user)
  combustions: Combustion[];

  @OneToMany(() => Combustion, (combustion) => combustion.moderator)
  moderatedCombustions: Combustion[];
}
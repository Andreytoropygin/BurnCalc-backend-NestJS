import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Combustion } from './combustion.entity';
import { Exclude } from 'class-transformer';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  @Exclude()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 50 })
  @Exclude()
  password: string;

  @Column({ name: 'is_expert' })
  isExpert: boolean;

  @OneToMany(() => Combustion, (combustion) => combustion.technician)
  @Exclude()
  combustions: Combustion[];

  @OneToMany(() => Combustion, (combustion) => combustion.expert)
  @Exclude()
  moderatedCombustions: Combustion[];
}
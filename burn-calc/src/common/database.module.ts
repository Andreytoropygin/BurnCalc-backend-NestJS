// src/common/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compound } from '../entities/compound.entity';
import { Combustion } from 'src/entities/combustion.entity';
import { CompoundCombustion } from '../entities/compound-combustion.entity';
import { User } from '../entities/user.entity';
import { CompoundRepository } from '../modules/compounds/repositories/compound.repository';
import { CombustionRepository } from '../modules/combustions/repositories/combustion.repository';
import { CompoundCombustionRepository } from '../modules/compound-combustions/repositories/compound-combustion.repository';
import { UserRepository } from '../modules/users/repositories/user.repository';

@Global()  // ← Делаем модуль глобальным!
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Compound,
      Combustion,
      CompoundCombustion,
      User,
    ]),
  ],
  providers: [
    CompoundRepository,
    CombustionRepository,
    CompoundCombustionRepository,
    UserRepository,
  ],
  exports: [
    CompoundRepository,
    CombustionRepository,
    CompoundCombustionRepository,
    UserRepository,
    TypeOrmModule,
  ],
})
export class DatabaseModule {}
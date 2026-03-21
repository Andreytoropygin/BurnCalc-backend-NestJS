// src/modules/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compound } from 'src/entities/compound.entity';
import { Combustion } from 'src/entities/combustion.entity';
import { CompoundCombustion } from 'src/entities/compound-combustion.entity';
import { User } from 'src/entities/user.entity';
import { CompoundRepository } from 'src/modules/compounds/compound.repository';
import { CombustionRepository } from 'src/modules/combustions/combustion.repository';
import { CompoundCombustionRepository } from 'src/modules/compound-combustions/compound-combustion.repository';
import { UserRepository } from 'src/modules/users/user.repository';

@Global()
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
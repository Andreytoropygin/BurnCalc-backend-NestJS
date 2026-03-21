// src/modules/compounds/compounds.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compound } from 'src/entities/compound.entity';
import { CompoundController } from './compound.controller';
import { CompoundService } from './compound.service';
import { CompoundRepository } from './compound.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Compound]), UsersModule],
  controllers: [CompoundController],
  providers: [CompoundService, CompoundRepository],
  exports: [CompoundService],
})
export class CompoundsModule {}
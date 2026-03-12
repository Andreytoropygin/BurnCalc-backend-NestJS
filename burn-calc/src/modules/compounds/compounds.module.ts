// src/modules/compounds/compounds.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compound } from '../../entities/compound.entity';
import { CompoundController } from './controllers/compound.controller';
import { CompoundService } from './services/compound.service';
import { CompoundRepository } from './repositories/compound.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Compound])],
  controllers: [CompoundController],
  providers: [CompoundService, CompoundRepository],
  exports: [CompoundService],
})
export class CompoundsModule {}
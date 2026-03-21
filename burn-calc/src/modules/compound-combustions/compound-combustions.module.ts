// src/modules/combustion-combustions/combustion-combustions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompoundCombustion } from '../../entities/compound-combustion.entity';
import { CompoundCombustionController } from './controllers/compound-combustions.controller';
import { CompoundCombustionService } from './services/compound-combustion.service';
import { CompoundCombustionRepository } from './repositories/compound-combustion.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompoundCombustion]),
  ],
  controllers: [CompoundCombustionController],
  providers: [CompoundCombustionService, CompoundCombustionRepository],
  exports: [CompoundCombustionService],
})
export class CompoundCombustionsModule {}
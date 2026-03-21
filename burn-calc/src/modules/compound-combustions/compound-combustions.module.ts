// src/modules/combustion-combustions/combustion-combustions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompoundCombustion } from 'src/entities/compound-combustion.entity';
import { CompoundCombustionController } from './compound-combustion.controller';
import { CompoundCombustionService } from './compound-combustion.service';
import { CompoundCombustionRepository } from './compound-combustion.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompoundCombustion]),
    UsersModule
  ],
  controllers: [CompoundCombustionController],
  providers: [CompoundCombustionService, CompoundCombustionRepository],
  exports: [CompoundCombustionService],
})
export class CompoundCombustionsModule {}
// src/modules/combustions/combustions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Combustion } from '../../entities/combustion.entity';
import { CombustionController } from './controllers/combustion.controller';
import { CombustionService } from './services/combustion.service';
import { CombustionRepository } from './repositories/combustion.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Combustion])],
  controllers: [CombustionController],
  providers: [CombustionService, CombustionRepository],
  exports: [CombustionService],
})
export class CombustionsModule {}
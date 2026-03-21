// src/modules/combustions/combustions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Combustion } from 'src/entities/combustion.entity';
import { CombustionController } from './combustion.controller';
import { CombustionService } from './combustion.service';
import { CombustionRepository } from './combustion.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Combustion]),
    UsersModule
  ],
  controllers: [CombustionController],
  providers: [CombustionService, CombustionRepository],
  exports: [CombustionService],
})
export class CombustionsModule {}
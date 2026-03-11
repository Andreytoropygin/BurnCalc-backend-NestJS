// src/modules/request-combustions/request-combustions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestCombustion } from '../../entities/request-combustion.entity';
import { RequestCombustionController } from './controllers/request-combustions.controller';
import { RequestCombustionService } from './services/request-combustion.service';
import { RequestCombustionRepository } from './repositories/request-combustion.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestCombustion]),
  ],
  controllers: [RequestCombustionController],
  providers: [RequestCombustionService, RequestCombustionRepository],
  exports: [RequestCombustionService],
})
export class RequestCombustionsModule {}
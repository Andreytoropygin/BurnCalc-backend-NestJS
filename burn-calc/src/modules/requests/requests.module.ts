// src/modules/requests/requests.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from '../../entities/request.entity';
import { RequestController } from './controllers/requests.controller';
import { RequestService } from './services/request.service';
import { RequestRepository } from './repositories/request.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request])
  ],
  controllers: [RequestController],
  providers: [RequestService, RequestRepository],
  exports: [RequestService],
})
export class RequestsModule {}
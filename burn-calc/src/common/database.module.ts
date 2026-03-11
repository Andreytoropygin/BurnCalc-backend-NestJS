// src/common/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Combustion } from '../entities/combustion.entity';
import { Request } from '../entities/request.entity';
import { RequestCombustion } from '../entities/request-combustion.entity';
import { User } from '../entities/user.entity';
import { CombustionRepository } from '../modules/combustions/repositories/combustion.repository';
import { RequestRepository } from '../modules/requests/repositories/request.repository';
import { RequestCombustionRepository } from '../modules/request-combustions/repositories/request-combustion.repository';
import { UserRepository } from '../modules/users/repositories/user.repository';

@Global()  // ← Делаем модуль глобальным!
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Combustion,
      Request,
      RequestCombustion,
      User,
    ]),
  ],
  providers: [
    CombustionRepository,
    RequestRepository,
    RequestCombustionRepository,
    UserRepository,
  ],
  exports: [
    CombustionRepository,
    RequestRepository,
    RequestCombustionRepository,
    UserRepository,
    TypeOrmModule,
  ],
})
export class DatabaseModule {}
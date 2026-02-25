import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BurnCalcController } from './burn-calc.controller';
import { BurnCalcService } from './burn-calc.service';

// ИМПОРТ ВСЕХ СУЩНОСТЕЙ
// Проверьте пути! Если папка entities лежит в src, то путь '../entities/...'
import { Compound } from '../entities/compound.entity';
import { Request } from '../entities/request.entity';
import { RequestCompound } from '../entities/request-compound.entity';
import { RequestStatus } from '../entities/request-status.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    // ВАЖНО: Перечислите здесь ВСЕ сущности, которые используются в сервисе
    TypeOrmModule.forFeature([
      Compound,        // <-- Ошибка была здесь (не было в списке или неверный путь)
      Request,
      RequestCompound,
      RequestStatus,
      User
    ]),
  ],
  controllers: [BurnCalcController],
  providers: [BurnCalcService],
  exports: [BurnCalcService], // Экспортируем, если сервис нужен в других модулях
})
export class BurnCalcModule {}
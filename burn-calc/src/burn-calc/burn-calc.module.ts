import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BurnCalcController } from './burn-calc.controller';
import { BurnCalcService } from './burn-calc.service';
import { APP_FILTER } from '@nestjs/core';
import { NotFoundRedirectFilter } from './filters/not-found-redirect.filter';

// ИМПОРТ ВСЕХ СУЩНОСТЕЙ
// Проверьте пути! Если папка entities лежит в src, то путь '../entities/...'
import { Combustion } from '../entities/combustion.entity';
import { Request } from '../entities/request.entity';
import { RequestCombustion } from '../entities/request-combustion.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    // ВАЖНО: Перечислите здесь ВСЕ сущности, которые используются в сервисе
    TypeOrmModule.forFeature([
      Combustion,        // <-- Ошибка была здесь (не было в списке или неверный путь)
      Request,
      RequestCombustion,
      User
    ]),
  ],
  controllers: [BurnCalcController],
  providers: [
    BurnCalcService,
    {
      provide: APP_FILTER,
      useClass: NotFoundRedirectFilter, // Только для этого модуля
    },
  ],
  exports: [BurnCalcService], // Экспортируем, если сервис нужен в других модулях
})
export class BurnCalcModule {}
import { Module } from '@nestjs/common';
import { BurnCalcService } from './burn-calc.service';
import { BurnCalcController } from './burn-calc.controller';

@Module({
  providers: [BurnCalcService],
  controllers: [BurnCalcController]
})
export class BurnCalcModule {}

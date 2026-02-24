import { Test, TestingModule } from '@nestjs/testing';
import { BurnCalcController } from './burn-calc.controller';

describe('BurnCalcController', () => {
  let controller: BurnCalcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BurnCalcController],
    }).compile();

    controller = module.get<BurnCalcController>(BurnCalcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

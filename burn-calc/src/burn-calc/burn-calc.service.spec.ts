import { Test, TestingModule } from '@nestjs/testing';
import { BurnCalcService } from './burn-calc.service';

describe('BurnCalcService', () => {
  let service: BurnCalcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BurnCalcService],
    }).compile();

    service = module.get<BurnCalcService>(BurnCalcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

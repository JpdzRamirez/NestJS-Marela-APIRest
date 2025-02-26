import { Test, TestingModule } from '@nestjs/testing';
import { SalesRateService } from './sales_rate.service';

describe('SalesRateService', () => {
  let service: SalesRateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesRateService],
    }).compile();

    service = module.get<SalesRateService>(SalesRateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { OverdueDebtService } from './overdue_debt.service';

describe('OverdueDebtService', () => {
  let service: OverdueDebtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OverdueDebtService],
    }).compile();

    service = module.get<OverdueDebtService>(OverdueDebtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

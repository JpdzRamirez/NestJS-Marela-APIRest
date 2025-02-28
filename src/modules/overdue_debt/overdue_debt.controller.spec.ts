import { Test, TestingModule } from '@nestjs/testing';
import { OverdueDebtController } from './overdue_debt.controller';

describe('OverdueDebtController', () => {
  let controller: OverdueDebtController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OverdueDebtController],
    }).compile();

    controller = module.get<OverdueDebtController>(OverdueDebtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

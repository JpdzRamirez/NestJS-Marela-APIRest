import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsActivityController } from './payments_activity.controller';

describe('PaymentsActivityController', () => {
  let controller: PaymentsActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsActivityController],
    }).compile();

    controller = module.get<PaymentsActivityController>(PaymentsActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsActivityService } from './payments_activity.service';

describe('PaymentsActivityService', () => {
  let service: PaymentsActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsActivityService],
    }).compile();

    service = module.get<PaymentsActivityService>(PaymentsActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SalesRateController } from './sales_rate.controller';

describe('SalesRateController', () => {
  let controller: SalesRateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesRateController],
    }).compile();

    controller = module.get<SalesRateController>(SalesRateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

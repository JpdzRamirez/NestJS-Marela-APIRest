import { Test, TestingModule } from '@nestjs/testing';
import { WaterMeterController } from './meters.controller';

describe('WaterMeterController', () => {
  let controller: WaterMeterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaterMeterController],
    }).compile();

    controller = module.get<WaterMeterController>(WaterMeterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

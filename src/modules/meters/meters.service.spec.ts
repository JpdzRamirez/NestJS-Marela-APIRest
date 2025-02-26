import { Test, TestingModule } from '@nestjs/testing';
import { WaterMeterService } from './meters.service';

describe('WaterMeterService', () => {
  let service: WaterMeterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaterMeterService],
    }).compile();

    service = module.get<WaterMeterService>(WaterMeterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

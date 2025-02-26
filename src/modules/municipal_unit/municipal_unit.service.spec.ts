import { Test, TestingModule } from '@nestjs/testing';
import { MunicipalUnitService } from './municipal_unit.service';

describe('MunicipalUnitService', () => {
  let service: MunicipalUnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MunicipalUnitService],
    }).compile();

    service = module.get<MunicipalUnitService>(MunicipalUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

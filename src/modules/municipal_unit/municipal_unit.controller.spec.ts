import { Test, TestingModule } from '@nestjs/testing';
import { MunicipalUnitController } from './municipal_unit.controller';

describe('MunicipalUnitController', () => {
  let controller: MunicipalUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MunicipalUnitController],
    }).compile();

    controller = module.get<MunicipalUnitController>(MunicipalUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

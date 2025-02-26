import { Test, TestingModule } from '@nestjs/testing';
import { TrailController } from './trails.controller';

describe('TrailController', () => {
  let controller: TrailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrailController],
    }).compile();

    controller = module.get<TrailController>(TrailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

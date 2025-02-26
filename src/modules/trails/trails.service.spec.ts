import { Test, TestingModule } from '@nestjs/testing';
import { TrailServices } from './trails.service';

describe('RoutesService', () => {
  let service: TrailServices;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrailServices],
    }).compile();

    service = module.get<TrailServices>(TrailServices);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

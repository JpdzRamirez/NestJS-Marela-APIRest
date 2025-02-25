import { Test, TestingModule } from '@nestjs/testing';
import { TypeClientService } from './type_client.service';

describe('TypeClientService', () => {
  let service: TypeClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeClientService],
    }).compile();

    service = module.get<TypeClientService>(TypeClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

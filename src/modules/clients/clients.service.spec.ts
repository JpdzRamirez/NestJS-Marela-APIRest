import { Test, TestingModule } from '@nestjs/testing';
import { ClientServices } from './clients.service';

describe('ClientService', () => {
  let service: ClientServices;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientServices],
    }).compile();

    service = module.get<ClientServices>(ClientServices);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

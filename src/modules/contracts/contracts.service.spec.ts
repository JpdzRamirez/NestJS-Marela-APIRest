import { Test, TestingModule } from '@nestjs/testing';
import { ContractServices } from './contracts.service';

describe('ContratosService', () => {
  let service: ContractServices;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractServices],
    }).compile();

    service = module.get<ContractServices>(ContractServices);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

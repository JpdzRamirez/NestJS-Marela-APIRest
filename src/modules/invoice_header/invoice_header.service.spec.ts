import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceHeaderService } from './invoice_header.service';

describe('InvoiceHeaderService', () => {
  let service: InvoiceHeaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceHeaderService],
    }).compile();

    service = module.get<InvoiceHeaderService>(InvoiceHeaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

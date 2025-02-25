import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceServices } from './invoices.service';

describe('FacturasService', () => {
  let service: InvoiceServices;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceServices],
    }).compile();

    service = module.get<InvoiceServices>(InvoiceServices);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

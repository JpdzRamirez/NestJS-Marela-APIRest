import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceFooterService } from './invoice_footer.service';

describe('InvoiceFooterService', () => {
  let service: InvoiceFooterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceFooterService],
    }).compile();

    service = module.get<InvoiceFooterService>(InvoiceFooterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

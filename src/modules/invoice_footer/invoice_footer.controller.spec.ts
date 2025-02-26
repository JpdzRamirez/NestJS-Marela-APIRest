import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceFooterController } from './invoice_footer.controller';

describe('InvoiceFooterController', () => {
  let controller: InvoiceFooterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceFooterController],
    }).compile();

    controller = module.get<InvoiceFooterController>(InvoiceFooterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceHeaderController } from './invoice_header.controller';

describe('InvoiceHeaderController', () => {
  let controller: InvoiceHeaderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceHeaderController],
    }).compile();

    controller = module.get<InvoiceHeaderController>(InvoiceHeaderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

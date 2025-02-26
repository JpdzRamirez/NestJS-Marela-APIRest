import { Test, TestingModule } from '@nestjs/testing';
import { ProductsActivityService } from './products_activity.service';

describe('ProductsActivityService', () => {
  let service: ProductsActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsActivityService],
    }).compile();

    service = module.get<ProductsActivityService>(ProductsActivityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

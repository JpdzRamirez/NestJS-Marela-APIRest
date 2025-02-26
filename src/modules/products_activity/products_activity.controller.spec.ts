import { Test, TestingModule } from '@nestjs/testing';
import { ProductsActivityController } from './products_activity.controller';

describe('ProductsActivityController', () => {
  let controller: ProductsActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsActivityController],
    }).compile();

    controller = module.get<ProductsActivityController>(ProductsActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

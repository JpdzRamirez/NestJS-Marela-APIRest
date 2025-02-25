import { Test, TestingModule } from '@nestjs/testing';
import { TypeClientController } from './type_client.controller';

describe('TypeClientController', () => {
  let controller: TypeClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeClientController],
    }).compile();

    controller = module.get<TypeClientController>(TypeClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

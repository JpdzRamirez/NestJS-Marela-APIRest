import { Test, TestingModule } from '@nestjs/testing';
import { TypeDocumentController } from './type_document.controller';

describe('TypeDocumentController', () => {
  let controller: TypeDocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeDocumentController],
    }).compile();

    controller = module.get<TypeDocumentController>(TypeDocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

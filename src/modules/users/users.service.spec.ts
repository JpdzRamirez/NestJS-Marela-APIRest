import { Test, TestingModule } from '@nestjs/testing';
import { UserServices } from './users.service';

describe('UserServices', () => {
  let service: UserServices;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserServices],
    }).compile();

    service = module.get<UserServices>(UserServices);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

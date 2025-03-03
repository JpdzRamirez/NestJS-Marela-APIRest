import { Test, TestingModule } from '@nestjs/testing';
import { UserServices } from './users.service';
import { UserRepository } from './users.repository';
import { UtilityService } from '../../shared/utility/utility.service';
import { User } from './user.entity';

describe('UserServices', () => {
  let service: UserServices;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserServices,
        {
          provide: UserRepository,
          useValue: {
            getAllUsers: jest.fn(),
            getUserById: jest.fn(),
            findByEmail: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
        UtilityService,
      ],
    }).compile();

    service = module.get<UserServices>(UserServices);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('debería retornar una lista de usuarios', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          name: 'Usuario 1',
          email: 'usuario1@example.com',
          created_at: new Date(),
          // Otras propiedades...
        },
        {
          id: 2,
          name: 'Usuario 2',
          email: 'usuario2@example.com',
          created_at: new Date()
        },
      ];
      jest.spyOn(userRepository, 'getAllUsers').mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();
      expect(result).toEqual(mockUsers);
    });

    it('Excepción si no hay usuarios', async () => {
      jest.spyOn(userRepository, 'getAllUsers').mockResolvedValue([]);

      await expect(service.getAllUsers()).rejects.toThrow(
        'No se encontraron usuarios',
      );
    });
  });

  
});
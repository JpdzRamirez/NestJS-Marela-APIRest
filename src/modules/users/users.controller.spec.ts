import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserServices } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { User } from './user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserServices;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserServices,
          useValue: {
            getAllUsers: jest.fn(),
            getUserById: jest.fn(),
            createUser: jest.fn(),
            updateUserById: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserServices>(UserServices);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('Retorna una lista de usuarios', async () => {
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
      jest.spyOn(userService, 'getAllUsers').mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();
      expect(result).toEqual(mockUsers);
    });
  });

});
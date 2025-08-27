
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConflictException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

const userMock = {
  id: '1',
  name: 'Ana',
  email: 'ana@mail.com',
  password_hash: '123',
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar usuário com sucesso', async () => {
      jest.spyOn(service, 'create').mockResolvedValueOnce(userMock);
      const dto: CreateUserDto = { name: 'Ana', email: 'ana@mail.com', password_hash: '123' };
      const result = await controller.create(dto);
      expect(result).toEqual(userMock);
    });
    it('deve lançar erro de conflito', async () => {
      jest.spyOn(service, 'create').mockRejectedValueOnce(new ConflictException('Já existe um usuário cadastrado com este e-mail.'));
      const dto: CreateUserDto = { name: 'Ana', email: 'ana@mail.com', password_hash: '123' };
      await expect(controller.create(dto)).rejects.toThrow(ConflictException);
    });
    it('deve lançar erro de dados obrigatórios', async () => {
      jest.spyOn(service, 'create').mockRejectedValueOnce(new BadRequestException('Dados obrigatórios ausentes ou inválidos.'));
      const dto: CreateUserDto = { name: 'Ana', email: 'ana@mail.com', password_hash: '' };
      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce([userMock]);
      const result = await controller.findAll();
      expect(result).toEqual([userMock]);
    });
  });

  describe('findOne', () => {
    it('deve retornar usuário existente', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(userMock);
      const result = await controller.findOne('1');
      expect(result).toEqual(userMock);
    });
    it('deve lançar erro se usuário não encontrado', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException('User not found'));
      await expect(controller.findOne('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar usuário com sucesso', async () => {
      jest.spyOn(service, 'update').mockResolvedValueOnce(userMock);
      const dto: UpdateUserDto = { name: 'NovoNome' };
      const result = await controller.update('1', dto);
      expect(result).toEqual(userMock);
    });
    it('deve lançar erro de conflito ao atualizar', async () => {
      jest.spyOn(service, 'update').mockRejectedValueOnce(new ConflictException('Já existe um usuário cadastrado com este e-mail.'));
      const dto: UpdateUserDto = { email: 'beto@mail.com' };
      await expect(controller.update('1', dto)).rejects.toThrow(ConflictException);
    });
    it('deve lançar erro de dados obrigatórios', async () => {
      jest.spyOn(service, 'update').mockRejectedValueOnce(new BadRequestException('Dados obrigatórios ausentes ou inválidos.'));
      const dto: UpdateUserDto = { name: '' };
      await expect(controller.update('1', dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deve remover usuário com sucesso', async () => {
      jest.spyOn(service, 'remove').mockResolvedValueOnce(undefined);
      await expect(controller.remove('1')).resolves.toBeUndefined();
    });
    it('deve lançar erro interno ao remover', async () => {
      jest.spyOn(service, 'remove').mockRejectedValueOnce(new InternalServerErrorException('Erro ao remover usuário. Tente novamente mais tarde.'));
      await expect(controller.remove('1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});

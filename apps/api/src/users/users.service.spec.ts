
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository, IsNull } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

const userArray = [
  { id: '1', name: 'Ana', email: 'ana@mail.com', password_hash: '123', is_active: true, created_at: new Date(), updated_at: new Date(), deleted_at: null },
  { id: '2', name: 'Beto', email: 'beto@mail.com', password_hash: '456', is_active: true, created_at: new Date(), updated_at: new Date(), deleted_at: null },
];

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn((dto) => dto),
            save: jest.fn((user) => Promise.resolve({ ...user, id: '1', created_at: new Date(), updated_at: new Date(), is_active: true, deleted_at: null })),
            find: jest.fn(() => Promise.resolve(userArray)),
            findOne: jest.fn(({ where }) => {
              if (where.id === '1' && where.deleted_at === IsNull()) return Promise.resolve(userArray[0] as User);
              if (where.email === 'ana@mail.com' && where.deleted_at === IsNull()) return Promise.resolve(userArray[0] as User);
              if (where.email === 'beto@mail.com' && where.deleted_at === IsNull()) return Promise.resolve(userArray[1] as User);
              return Promise.resolve(null);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('cria usuário com sucesso', async () => {
  jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
  const dto: Partial<User> = { name: 'Novo', email: 'novo@mail.com', password_hash: 'abc' };
  const result = await service.create(dto as CreateUserDto);
  expect(result).toHaveProperty('id');
    });
    it('lança erro de conflito se e-mail já existe', async () => {
  jest.spyOn(repo, 'findOne').mockResolvedValueOnce(userArray[0] as User);
  await expect(service.create({ name: 'Ana', email: 'ana@mail.com', password_hash: '123' } as CreateUserDto)).rejects.toThrow(ConflictException);
    });
    it('lança erro de dados obrigatórios ausentes', async () => {
  jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
  jest.spyOn(repo, 'save').mockRejectedValueOnce({ code: '23502' });
  await expect(service.create({ name: 'SemSenha', email: 'sem@mail.com' } as CreateUserDto)).rejects.toThrow(BadRequestException);
    });
    it('lança erro interno para outros erros', async () => {
  jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
  jest.spyOn(repo, 'save').mockRejectedValueOnce({ code: '99999' });
  await expect(service.create({ name: 'Falha', email: 'falha@mail.com', password_hash: 'x' } as CreateUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('retorna todos os usuários', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('retorna usuário existente', async () => {
  jest.spyOn(repo, 'findOne').mockResolvedValueOnce(userArray[0]);
  const result = await service.findOne(1);
  expect(result).toHaveProperty('id', '1');
    });
    it('lança erro se usuário não encontrado', async () => {
  jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
  await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza usuário com sucesso', async () => {
  jest.spyOn(service, 'findOne').mockResolvedValueOnce(userArray[0] as User);
  jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
  const result = await service.update(1, { name: 'NovoNome' } as UpdateUserDto);
  expect(result).toHaveProperty('id');
    });
    it('lança erro de conflito ao atualizar e-mail para um já existente', async () => {
  jest.spyOn(service, 'findOne').mockResolvedValueOnce(userArray[0] as User);
  jest.spyOn(repo, 'findOne').mockResolvedValueOnce(userArray[1] as User);
  await expect(service.update(1, { email: 'beto@mail.com' } as UpdateUserDto)).rejects.toThrow(ConflictException);
    });
    it('lança erro de dados obrigatórios ausentes', async () => {
  jest.spyOn(service, 'findOne').mockResolvedValueOnce(userArray[0] as User);
  jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
  jest.spyOn(repo, 'save').mockRejectedValueOnce({ code: '23502' });
  await expect(service.update(1, { name: 'SemNome' } as UpdateUserDto)).rejects.toThrow(BadRequestException);
    });
    it('lança erro interno para outros erros', async () => {
  jest.spyOn(service, 'findOne').mockResolvedValueOnce(userArray[0] as User);
  jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
  jest.spyOn(repo, 'save').mockRejectedValueOnce({ code: '99999' });
  await expect(service.update(1, { name: 'Falha' } as UpdateUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('remove usuário com sucesso (soft delete)', async () => {
  jest.spyOn(service, 'findOne').mockResolvedValueOnce(userArray[0] as User);
  jest.spyOn(repo, 'save').mockResolvedValueOnce({ ...userArray[0], deleted_at: new Date() } as User);
  await expect(service.remove(1)).resolves.toBeUndefined();
    });
    it('lança erro interno ao remover', async () => {
  jest.spyOn(service, 'findOne').mockResolvedValueOnce(userArray[0] as User);
  jest.spyOn(repo, 'save').mockRejectedValueOnce(new Error('Falha'));
  await expect(service.remove(1)).rejects.toThrow(InternalServerErrorException);
    });
  });
});

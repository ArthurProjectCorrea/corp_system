
import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verifica se já existe usuário com o mesmo e-mail
    const existing = await this.userRepository.findOne({ where: { email: createUserDto.email, deleted_at: IsNull() } });
    if (existing) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail.');
    }
    try {
      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error
      ) {
        const code = (error as { code?: string }).code;
        if (code === '23502') {
          // Campo obrigatório ausente
          throw new BadRequestException('Dados obrigatórios ausentes ou inválidos.');
        }
        if (code === '23505') {
          // Violação de unique constraint (e-mail duplicado)
          throw new ConflictException('Já existe um usuário cadastrado com este e-mail.');
        }
      }
      throw new InternalServerErrorException('Erro ao criar usuário. Tente novamente mais tarde.');
    }
  }


  async findAll(): Promise<User[]> {
    return this.userRepository.find({ where: { deleted_at: IsNull() } });
  }

  async findOne(id: number): Promise<User> {
    if (!id || isNaN(Number(id))) {
      throw new BadRequestException('ID de usuário inválido.');
    }
    const user = await this.userRepository.findOne({ where: { id: String(id), deleted_at: IsNull() } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    // Se for atualizar o e-mail, verifica duplicidade
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepository.findOne({ where: { email: updateUserDto.email, deleted_at: IsNull() } });
      if (existing) {
        throw new ConflictException('Já existe um usuário cadastrado com este e-mail.');
      }
    }
    try {
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === '23502'
      ) {
        throw new BadRequestException('Dados obrigatórios ausentes ou inválidos.');
      }
      throw new InternalServerErrorException('Erro ao atualizar usuário. Tente novamente mais tarde.');
    }
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    try {
      user.deleted_at = new Date();
      await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Erro ao remover usuário. Tente novamente mais tarde.');
    }
  }
}

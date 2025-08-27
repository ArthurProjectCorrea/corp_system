
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';



describe('Users e2e', () => {
  let app: INestApplication;
  let server: ReturnType<typeof app.getHttpServer>;
  const userPayload = { name: 'e2e user', email: 'e2e@mail.com', password_hash: 'senha123' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    // Limpa a tabela users antes de cada teste usando o repositório do TypeORM
    const userRepo = app.get(getRepositoryToken(User));
    await userRepo.query('DELETE FROM users');
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users - deve criar usuário', async () => {
    const res = await request(server)
      .post('/users')
      .send(userPayload)
      .expect(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(userPayload.email);
  });

  it('GET /users - deve listar usuários', async () => {
    // Cria usuário antes de listar
    await request(server).post('/users').send(userPayload).expect(201);
    const res = await request(server).get('/users').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((u: { email: string }) => u.email === userPayload.email)).toBe(true);
  });

  it('GET /users/:id - deve retornar usuário específico', async () => {
    const createRes = await request(server).post('/users').send(userPayload).expect(201);
    const id = createRes.body.id;
    const res = await request(server).get(`/users/${id}`).expect(200);
    expect(res.body).toHaveProperty('id', id);
    expect(res.body.email).toBe(userPayload.email);
  });

  it('PATCH /users/:id - deve atualizar usuário', async () => {
    const createRes = await request(server).post('/users').send(userPayload).expect(201);
    const id = createRes.body.id;
    const res = await request(server)
      .patch(`/users/${id}`)
      .send({ name: 'e2e atualizado' })
      .expect(200);
    expect(res.body.name).toBe('e2e atualizado');
  });

  it('DELETE /users/:id - deve remover usuário (soft delete)', async () => {
    const createRes = await request(server).post('/users').send(userPayload).expect(201);
    const id = createRes.body.id;
    await request(server).delete(`/users/${id}`).expect(200);
    // Após remoção, não deve ser listado
    const res = await request(server).get('/users').expect(200);
    expect(res.body.some((u: { id: string }) => u.id === id)).toBe(false);
  });

  it('POST /users - deve retornar 409 para e-mail duplicado', async () => {
    await request(server)
      .post('/users')
      .send(userPayload)
      .expect(201);
    await request(server)
      .post('/users')
      .send({ name: 'Outro', email: userPayload.email, password_hash: 'senha123' })
      .expect(409);
  });

  it('POST /users - deve retornar 400 para payload inválido', async () => {
    await request(server)
      .post('/users')
      .send({ name: '', email: 'invalido', password_hash: '' })
      .expect(400);
  });
});

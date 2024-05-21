import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/services/user.service';

describe('UserController (e2e)', () => {
  let app;
  let userService: UserService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);
    await app.init();
  });

  it('/api/user/$userId (GET) - not found', () => {
    return request(app.getHttpServer()).get('/api/user/123').expect(404);
  });

  it('/api/user/$userId (GET) - success', async () => {
    const createdUser = await userService.upsertUser({
      telegramId: 123456,
      firstName: 'Test User',
      lastName: 'Bob',
    });

    return request(app.getHttpServer())
      .get(`/api/user/${createdUser.id}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.id).toEqual(createdUser.id);
        expect(body.firstName).toEqual('Test User');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

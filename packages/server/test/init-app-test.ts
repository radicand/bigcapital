import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/modules/App/App.module';

let app: INestApplication;

const email = 'bigcapital@bigcapital.com';
const password = '123123123';

let orgainzationId = '';
let authenticationToken = '';
let AuthorizationHeader = '';

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  // Attempt sign-in first; if the test user doesn't exist yet, sign up and
  // build the organization so all spec files share a ready-to-use tenant.
  let signinResponse = await request(app.getHttpServer())
    .post('/auth/signin')
    .send({ email, password });

  if (!signinResponse.body.access_token) {
    // User doesn't exist — create it.
    const signupResponse = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        firstName: 'Bigcapital',
        lastName: 'Test',
        email,
        password,
      });

    // Sign in with the newly created account.
    signinResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({ email, password });

    const newOrgId = signinResponse.body.organization_id;
    const newToken = `Bearer ${signinResponse.body.access_token}`;

    // Initialize the organization so tenant DB migrations run.
    await request(app.getHttpServer())
      .post('/organization/build')
      .set('Authorization', newToken)
      .set('organization-id', newOrgId)
      .send({
        name: 'Bigcapital Test Org',
        baseCurrency: 'USD',
        location: 'US',
        language: 'en',
        fiscalYear: 'january',
        timezone: 'UTC',
      });
  }

  authenticationToken = signinResponse.body.access_token;
  AuthorizationHeader = `Bearer ${authenticationToken}`;
  orgainzationId = signinResponse.body.organization_id;

  // Cancel any leftover transactions lock from previous test runs to ensure a clean state.
  await request(app.getHttpServer())
    .put('/transactions-locking/cancel-lock')
    .set('Authorization', AuthorizationHeader)
    .set('organization-id', orgainzationId)
    .send({ module: 'all', reason: 'test suite init cleanup' });
}, 120000);

afterAll(async () => {
  await app.close();
});
jest.retryTimes(3, { logErrorsBeforeRetry: true });

export { app, orgainzationId, authenticationToken, AuthorizationHeader };

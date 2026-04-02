import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { app, AuthorizationHeader, orgainzationId } from './init-app-test';

let userId;
let userEmail;
let userRoleId;

describe('Users (e2e)', () => {
  beforeAll(async () => {
    const usersResponse = await request(app.getHttpServer())
      .get('/users')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader);

    if (usersResponse.body.length > 0) {
      const user = usersResponse.body[0];
      userId = user.id;
      userEmail = user.email;
      userRoleId = user.role_id ?? user.roleId ?? 1;
    }
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/users/:id (GET)', async () => {
    if (!userId) {
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('organization-id', orgainzationId)
        .set('Authorization', AuthorizationHeader);

      if (usersResponse.body.length > 0) {
        userId = usersResponse.body[0].id;
      }
    }

    if (userId) {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('organization-id', orgainzationId)
        .set('Authorization', AuthorizationHeader)
        .expect(200);
    }
  });

  it('/users/:id (POST)', async () => {
    if (!userId) {
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('organization-id', orgainzationId)
        .set('Authorization', AuthorizationHeader);

      if (usersResponse.body.length > 0) {
        userId = usersResponse.body[0].id;
      }
    }
    if (userId) {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('organization-id', orgainzationId)
        .set('Authorization', AuthorizationHeader)
        .send({
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: userEmail || 'bigcapital@bigcapital.com',
          roleId: userRoleId || 1,
        })
        .expect(200);
    }
  });

  // it('/users/:id/activate (PUT)', async () => {
  //   if (!userId) {
  //     const usersResponse = await request(app.getHttpServer())
  //       .get('/users')
  //       .set('organization-id', orgainzationId)
  //       .set('Authorization', AuthorizationHeader);

  //     if (usersResponse.body.length > 0) {
  //       userId = usersResponse.body[0].id;
  //     }
  //   }

  //   if (userId) {
  //     return request(app.getHttpServer())
  //       .put(`/users/${userId}/activate`)
  //       .set('organization-id', orgainzationId)
  //       .set('Authorization', AuthorizationHeader)
  //       .expect(200);
  //   }
  // });

  // it('/users/:id/inactivate (PUT)', async () => {
  //   if (!userId) {
  //     const usersResponse = await request(app.getHttpServer())
  //       .get('/users')
  //       .set('organization-id', orgainzationId)
  //       .set('Authorization', AuthorizationHeader);

  //     if (usersResponse.body.length > 0) {
  //       userId = usersResponse.body[0].id;
  //     }
  //   }

  //   if (userId) {
  //     return request(app.getHttpServer())
  //       .put(`/users/${userId}/inactivate`)
  //       .set('organization-id', orgainzationId)
  //       .set('Authorization', AuthorizationHeader)
  //       .expect(200);
  //   }
  // });
});

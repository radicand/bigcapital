import * as request from 'supertest';
import { app, AuthorizationHeader, orgainzationId } from './init-app-test';

describe('Attachments (e2e)', () => {
  it('/attachments/:id/presigned-url (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/attachments/test-id/presigned-url')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader);

    // 200 when S3 is configured, 503 when S3 is not configured (test environment).
    expect([200, 503]).toContain(response.status);
  });
});

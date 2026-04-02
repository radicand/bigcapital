import * as request from 'supertest';
import { app, AuthorizationHeader, orgainzationId } from './init-app-test';

describe('Payment Services (e2e)', () => {
  it('/payment-services (GET)', () => {
    return request(app.getHttpServer())
      .get('/payment-services')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/payment-services/state (GET)', () => {
    return request(app.getHttpServer())
      .get('/payment-services/state')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/payment-services/:paymentServiceId (GET)', async () => {
    // Get a real payment service ID from the list endpoint.
    const list = await request(app.getHttpServer())
      .get('/payment-services')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader);

    const services = list.body?.paymentServices ?? [];
    if (services.length === 0) {
      // No payment services configured — skip the ID-specific test.
      return;
    }
    const serviceId = services[0].id;

    return request(app.getHttpServer())
      .get(`/payment-services/${serviceId}`)
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });
});

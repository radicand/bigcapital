import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { app, AuthorizationHeader, orgainzationId } from './init-app-test';

describe('Inventory Cost (e2e)', () => {
  let itemId: number;

  beforeAll(async () => {
    const item = await request(app.getHttpServer())
      .post('/items')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({
        name: faker.commerce.productName(),
        type: 'inventory',
        sellable: true,
        purchasable: true,
        sellAccountId: 1026,
        costAccountId: 1019,
        costPrice: 100,
        sellPrice: 100,
      });
    itemId = item.body.id;
  });

  it('/inventory-cost/items (GET)', () => {
    return request(app.getHttpServer())
      .get('/inventory-cost/items')
      .query({ itemsIds: itemId, date: '2023-01-01' })
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });
});

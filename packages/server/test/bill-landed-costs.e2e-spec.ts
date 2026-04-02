import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { app, AuthorizationHeader, orgainzationId } from './init-app-test';

let billId: number;

describe('Bill Landed Costs (e2e)', () => {
  beforeAll(async () => {
    const vendor = await request(app.getHttpServer())
      .post('/vendors')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({ displayName: `Vendor ${Date.now()}` });

    const item = await request(app.getHttpServer())
      .post('/items')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({
        name: faker.commerce.productName(),
        type: 'service',
        sellable: true,
        purchasable: true,
        sellAccountId: 1026,
        costAccountId: 1019,
        costPrice: 100,
        sellPrice: 100,
      });

    const bill = await request(app.getHttpServer())
      .post('/bills')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({
        vendorId: vendor.body.id,
        billDate: '2023-01-01',
        dueDate: '2023-02-01',
        billNumber: faker.string.alphanumeric(10),
        entries: [{ index: 1, itemId: item.body.id, quantity: 2, rate: 500 }],
      });
    billId = bill.body.id;
  });

  it('/landed-cost/transactions (GET)', () => {
    return request(app.getHttpServer())
      .get('/landed-cost/transactions')
      .query({ transactionType: 'Bill' })
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/landed-cost/bills/:billId/transactions (GET)', () => {
    return request(app.getHttpServer())
      .get(`/landed-cost/bills/${billId}/transactions`)
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });
});

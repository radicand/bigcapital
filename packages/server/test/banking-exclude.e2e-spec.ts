import * as request from 'supertest';
import * as mysql from 'mysql2/promise';
import { app, AuthorizationHeader, orgainzationId } from './init-app-test';

let transactionId: number;
let transactionId2: number;
let transactionId3: number;

async function insertUncategorizedTransaction(amount: number): Promise<number> {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'bigcapital',
    password: 'bigcapital',
    database: `bigcapital_tenant_${orgainzationId}`,
  });
  const [result] = await conn.execute(
    `INSERT INTO UNCATEGORIZED_CASHFLOW_TRANSACTIONS (DATE, AMOUNT, CURRENCY_CODE, ACCOUNT_ID, DESCRIPTION, CATEGORIZED, CREATED_AT)
     VALUES (?, ?, 'USD', 1000, 'Test transaction', 0, NOW())`,
    ['2023-01-01', amount],
  );
  await conn.end();
  return (result as any).insertId;
}

describe('Banking Exclude (e2e)', () => {
  beforeAll(async () => {
    transactionId = await insertUncategorizedTransaction(100);
    transactionId2 = await insertUncategorizedTransaction(50);
    transactionId3 = await insertUncategorizedTransaction(75);
  });

  it('/banking/exclude (GET)', () => {
    return request(app.getHttpServer())
      .get('/banking/exclude')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/banking/exclude/:id (PUT)', () => {
    return request(app.getHttpServer())
      .put(`/banking/exclude/${transactionId}`)
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/banking/exclude/bulk (PUT)', () => {
    return request(app.getHttpServer())
      .put('/banking/exclude/bulk')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({ ids: [transactionId] })
      .expect(200);
  });

  it('/banking/exclude/:id (DELETE)', async () => {
    // Exclude transactionId2 first, then unexclude it.
    await request(app.getHttpServer())
      .put(`/banking/exclude/${transactionId2}`)
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader);

    return request(app.getHttpServer())
      .delete(`/banking/exclude/${transactionId2}`)
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/banking/exclude/bulk (DELETE)', async () => {
    await request(app.getHttpServer())
      .put(`/banking/exclude/${transactionId3}`)
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader);

    return request(app.getHttpServer())
      .delete('/banking/exclude/bulk')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({ ids: [transactionId3] })
      .expect(200);
  });
});

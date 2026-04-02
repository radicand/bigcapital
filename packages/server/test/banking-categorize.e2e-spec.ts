import * as request from 'supertest';
import * as mysql from 'mysql2/promise';
import { app, AuthorizationHeader, orgainzationId } from './init-app-test';

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
     VALUES (?, ?, 'USD', 1000, 'Test categorize transaction', 0, NOW())`,
    ['2023-01-01', amount],
  );
  await conn.end();
  return (result as any).insertId;
}

describe('Banking Categorize (e2e)', () => {
  it('/banking/categorize (POST)', async () => {
    const txnId = await insertUncategorizedTransaction(200);

    return request(app.getHttpServer())
      .post('/banking/categorize')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({
        uncategorizedTransactionIds: [txnId],
        date: '2023-01-01',
        creditAccountId: 1014,
        transactionType: 'owner_contribution',
      })
      .expect(201);
  });

  it('/banking/categorize/:id (DELETE)', async () => {
    const txnId = await insertUncategorizedTransaction(200);

    // Categorize first so we can uncategorize
    await request(app.getHttpServer())
      .post('/banking/categorize')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({
        uncategorizedTransactionIds: [txnId],
        date: '2023-01-01',
        creditAccountId: 1014,
        transactionType: 'owner_contribution',
      });

    return request(app.getHttpServer())
      .delete(`/banking/categorize/${txnId}`)
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/banking/categorize/bulk (DELETE)', async () => {
    const txnId1 = await insertUncategorizedTransaction(200);
    const txnId2 = await insertUncategorizedTransaction(200);

    // Categorize both first
    await request(app.getHttpServer())
      .post('/banking/categorize')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({
        uncategorizedTransactionIds: [txnId1, txnId2],
        date: '2023-01-01',
        creditAccountId: 1014,
        transactionType: 'owner_contribution',
      });

    return request(app.getHttpServer())
      .delete('/banking/categorize/bulk')
      .query({ uncategorizedTransactionIds: [txnId1, txnId2] })
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });
});

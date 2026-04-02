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
     VALUES (?, ?, 'USD', 1000, 'Test matching transaction', 0, NOW())`,
    ['2023-01-01', amount],
  );
  await conn.end();
  return (result as any).insertId;
}

describe('Banking Matching (e2e)', () => {
  let uncategorizedTxnId: number;

  beforeAll(async () => {
    uncategorizedTxnId = await insertUncategorizedTransaction(500);
  });

  it('/banking/matching/matched (GET)', () => {
    return request(app.getHttpServer())
      .get('/banking/matching/matched')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/banking/matching/match (POST)', async () => {
    // Create a real cashflow transaction to use as the matched reference.
    const cashflowResp = await request(app.getHttpServer())
      .post('/banking/transactions')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({
        date: '2023-01-01',
        transactionType: 'owner_contribution',
        amount: 500,
        description: 'Test matching cashflow',
        creditAccountId: 1014,
        cashflowAccountId: 1000,
        publish: true,
        branchId: 1,
      });
    const cashflowId = cashflowResp.body.id;

    return request(app.getHttpServer())
      .post('/banking/matching/match')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .send({
        uncategorizedTransactions: [uncategorizedTxnId],
        matchedTransactions: [{ referenceType: 'CashflowTransaction', referenceId: cashflowId }],
      })
      .expect(201);
  });

  it('/banking/matching/unmatch/:uncategorizedTransactionId (PATCH)', () => {
    return request(app.getHttpServer())
      .patch(`/banking/matching/unmatch/${uncategorizedTxnId}`)
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });
});

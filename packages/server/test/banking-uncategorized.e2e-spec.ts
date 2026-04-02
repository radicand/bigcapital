import * as request from 'supertest';
import * as mysql from 'mysql2/promise';
import { app, AuthorizationHeader, orgainzationId } from './init-app-test';

let uncatTxnId: number;

async function insertUncategorizedTransaction(): Promise<number> {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'bigcapital',
    password: 'bigcapital',
    database: `bigcapital_tenant_${orgainzationId}`,
  });
  const [result] = await conn.execute(
    `INSERT INTO UNCATEGORIZED_CASHFLOW_TRANSACTIONS (DATE, AMOUNT, CURRENCY_CODE, ACCOUNT_ID, DESCRIPTION, CATEGORIZED, CREATED_AT)
     VALUES ('2023-01-01', 100, 'USD', 1000, 'Test uncategorized', 0, NOW())`,
  );
  await conn.end();
  return (result as any).insertId;
}

describe('Banking Uncategorized Transactions (e2e)', () => {
  beforeAll(async () => {
    uncatTxnId = await insertUncategorizedTransaction();
  });

  it('/banking/uncategorized/:uncategorizedTransactionId (GET)', () => {
    return request(app.getHttpServer())
      .get(`/banking/uncategorized/${uncatTxnId}`)
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/banking/uncategorized/accounts/:accountId (GET)', () => {
    return request(app.getHttpServer())
      .get('/banking/uncategorized/accounts/1000')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/banking/uncategorized/autofill (GET)', () => {
    return request(app.getHttpServer())
      .get('/banking/uncategorized/autofill')
      .query({ uncategorizedTransactionIds: uncatTxnId })
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });
});

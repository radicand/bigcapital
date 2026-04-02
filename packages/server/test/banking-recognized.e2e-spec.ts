import * as request from 'supertest';
import * as mysql from 'mysql2/promise';
import { app, AuthorizationHeader, orgainzationId } from './init-app-test';

let recognizedTxnId: number;

async function insertRecognizedTransaction(): Promise<number> {
  // First create an uncategorized transaction to link to the recognized one.
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'bigcapital',
    password: 'bigcapital',
    database: `bigcapital_tenant_${orgainzationId}`,
  });
  const [uncatResult] = await conn.execute(
    `INSERT INTO UNCATEGORIZED_CASHFLOW_TRANSACTIONS (DATE, AMOUNT, CURRENCY_CODE, ACCOUNT_ID, DESCRIPTION, CATEGORIZED, CREATED_AT)
     VALUES ('2023-01-01', 100, 'USD', 1000, 'Test recognized', 0, NOW())`,
  );
  const uncatId = (uncatResult as any).insertId;

  const [recResult] = await conn.execute(
    `INSERT INTO RECOGNIZED_BANK_TRANSACTIONS (UNCATEGORIZED_TRANSACTION_ID, ASSIGNED_CATEGORY, ASSIGNED_ACCOUNT_ID, CREATED_AT)
     VALUES (?, 'owner_contribution', 1000, NOW())`,
    [uncatId],
  );
  const recId = (recResult as any).insertId;

  // Link the recognized transaction back to the uncategorized transaction.
  await conn.execute(
    `UPDATE UNCATEGORIZED_CASHFLOW_TRANSACTIONS SET RECOGNIZED_TRANSACTION_ID = ? WHERE ID = ?`,
    [recId, uncatId],
  );
  await conn.end();

  // Return the uncategorized transaction ID (the endpoint uses this as the param).
  return uncatId;
}

describe('Banking Recognized Transactions (e2e)', () => {
  beforeAll(async () => {
    recognizedTxnId = await insertRecognizedTransaction();
  });

  it('/banking/recognized (GET)', () => {
    return request(app.getHttpServer())
      .get('/banking/recognized')
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });

  it('/banking/recognized/:recognizedTransactionId (GET)', () => {
    return request(app.getHttpServer())
      .get(`/banking/recognized/${recognizedTxnId}`)
      .set('organization-id', orgainzationId)
      .set('Authorization', AuthorizationHeader)
      .expect(200);
  });
});

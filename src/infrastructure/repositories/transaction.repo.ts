import { Pool } from "pg";
import { TransactionStatus } from "../../domain/enums";
import { ITransactionRepo } from "../../application/transaction.repo";

export class TransactionRepo implements ITransactionRepo {
  constructor(private pool: Pool) {}

  async create(data: {
    amount: number;
    currency: string;
    card_mask: string;
    order_id: string;
    transactionId: string;
  }) {
    const query = `
      INSERT INTO transactions (id, order_id, amount, currency, status, card_mask, psp_transaction_id, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, 'CREATED', $4, $5, NOW(), NOW())
      RETURNING *;
    `;

    const values = [
      data.order_id,
      data.amount,
      data.currency,
      data.card_mask,
      data.transactionId,
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findById(id: string) {
    const query = `SELECT * FROM transactions WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByTransactionId(transactionId: string) {
    const query = `SELECT * FROM transactions WHERE psp_transaction_id = $1`;
    const result = await this.pool.query(query, [transactionId]);
    return result.rows[0] || null;
  }

  async findByIdAndLock(id: string): Promise<any> {
    const query = `SELECT * FROM transactions WHERE id = $1 FOR UPDATE`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0];
  }

  async updateStatus(
    id: string,
    status: TransactionStatus,
    finalAmount?: number,
    transactionId?: string,
  ) {
    const query = `
      UPDATE transactions 
      SET status = $1, 
          amount = COALESCE($2, amount),
          updated_at = NOW(),
          psp_transaction_id = COALESCE($3, psp_transaction_id)
      WHERE id = $4
    `;
    await this.pool.query(query, [
      status,
      finalAmount || null,
      transactionId || null,
      id,
    ]);
  }
}

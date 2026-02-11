import { TransactionStatus } from "../domain/enums";

export interface ITransactionRepo {
  create(data: {
    amount: number;
    currency: string;
    card_mask: string;
    order_id: string;
  }): Promise<any>;
  findById(id: string): Promise<any>;
  findByTransactionId(transactionId: string): Promise<any>;
  findByIdAndLock(id: string): Promise<any>;
  updateStatus(
    id: string,
    status: TransactionStatus,
    finalAmount?: number,
    transactionId?: string,
  ): Promise<void>;
}

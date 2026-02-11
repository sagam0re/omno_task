import { TransactionStatus } from "../../../domain/enums";

export interface WebhookDto {
  transactionId: string;
  status: TransactionStatus;
  final_amount: number;
}

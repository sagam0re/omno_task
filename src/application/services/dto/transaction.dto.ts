import { Currency, TransactionStatus } from "../../../domain/enums";

export interface CreateTransactionDto {
  amount: number;
  currency: Currency;
  cardNumber: string;
  cardExpiry: string;
  cvv: string;
  orderId: string;
  callbackUrl: string;
  failureUrl: string;
}

export type CreateTransactionResultDto = {
  transactionId: string;
  status: TransactionStatus;
  redirectUrl?: string | undefined;
};

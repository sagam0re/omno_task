import { Currency, TransactionStatus } from "../../../domain/enums";

export interface PspProcessDto {
  transactionId: string;
  internalId: string;
  amount: number;
  currency: Currency;
  cardNumber: string;
  cardExpiry: string;
  cvv: string;
  orderId: string;
  callbackUrl: string;
  failureUrl: string;
}

export interface PspResponseDto {
  status: TransactionStatus;
  transactionId?: string;
  "3DSRedirectUrl"?: string;
}

export interface Psp3dsDto {
  success: boolean;
}

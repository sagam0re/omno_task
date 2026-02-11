import {
  CreateTransactionDto,
  CreateTransactionResultDto,
} from "../dto/transaction.dto";
import { WebhookDto } from "../dto/webhook.dto";

export interface ITransactionService {
  createTransaction: (
    payload: CreateTransactionDto,
  ) => Promise<CreateTransactionResultDto>;
  handleWebhook: (payload: WebhookDto) => Promise<void>;
}

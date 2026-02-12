import axios from "axios";
import {
  CreateTransactionDto,
  CreateTransactionResultDto,
} from "../dto/transaction.dto";
import { WebhookDto } from "../dto/webhook.dto";
import { ITransactionRepo } from "../../transaction.repo";
import { TransactionStateMachine } from "../../../domain/transactionState";
import { TransactionStatus } from "../../../domain/enums";
import { ITransactionService } from "./transaction.interface";
import { maskCardNumber } from "../../utils/card-utils";
import { randomUUID } from "crypto";
import { pool } from "../../../api/plugins/db";

export class TransactionService implements ITransactionService {
  constructor(private transactionRepo: ITransactionRepo) {}

  async createTransaction(
    payload: CreateTransactionDto,
  ): Promise<CreateTransactionResultDto> {
    const randomTransactionId = `tx_${randomUUID()}`;
    const maskedCard = maskCardNumber(payload.cardNumber);
    const transaction = await this.transactionRepo.create({
      amount: payload.amount,
      currency: payload.currency,
      card_mask: maskedCard,
      order_id: payload.orderId,
    });

    try {
      // In real life usually we use public webhooks, but for docker simulation:
      // PSP -> Payment Service (Webhook) : Needs Internal Docker URL
      // Browser -> Payment Service (Failure) : Needs Public Localhost URL

      const pspResponse = await axios.post(
        `${process.env.BASE_URL}/psp/transactions`,
        {
          ...payload,
          transactionId: transaction.id,
          internalId: randomTransactionId,
          callbackUrl: `${process.env.BASE_URL}/webhooks/psp`,
          failureUrl: `${process.env.BASE_URL}/transactions/failure`,
        },
      );

      const {
        status: pspStatus,
        redirectUrl,
        transactionId,
      } = pspResponse.data;

      if (pspStatus === TransactionStatus.FAILED) {
        await this.transactionRepo.updateStatus(
          transaction.id,
          TransactionStatus.FAILED,
          payload.amount,
          transactionId,
        );
        return {
          transactionId: transaction.id,
          status: TransactionStatus.FAILED,
        };
      }

      TransactionStateMachine.validateTransition(
        TransactionStatus.CREATED,
        pspStatus,
      );
      await this.transactionRepo.updateStatus(
        transaction.id,
        pspStatus,
        payload.amount,
        transactionId,
      );

      return {
        transactionId: transaction.id,
        status: pspStatus,
        redirectUrl:
          pspStatus === TransactionStatus.PENDING_3DS ? redirectUrl : undefined,
      };
    } catch (error) {
      await this.transactionRepo.updateStatus(
        transaction.id,
        TransactionStatus.FAILED,
        payload.amount,
      );
      throw error;
    }
  }

  async handleWebhook(payload: WebhookDto): Promise<void> {
    const client = await pool.connect();
    console.log("Webhook received", payload);

    try {
      await client.query("BEGIN");

      const tx = await this.transactionRepo.findByTransactionId(
        payload.transactionId,
      );

      if (!tx) throw new Error("Transaction not found");

      if (TransactionStateMachine.isTerminal(tx.status)) {
        await client.query("ROLLBACK");
        return;
      }

      TransactionStateMachine.validateTransition(tx.status, payload.status);

      await this.transactionRepo.updateStatus(
        tx.id,
        payload.status,
        payload.final_amount,
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

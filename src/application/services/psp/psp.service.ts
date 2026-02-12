import axios from "axios";
import { PspProcessDto } from "../dto/psp.dto";
import { TransactionStatus } from "../../../domain/enums";
import { IPSPService } from "./psp.interface";

export class PSPService implements IPSPService {
  private transactions = new Map<
    string,
    {
      amount: number;
      callbackUrl: string;
      currency: string;
      failureUrl: string;
    }
  >();

  async processTransaction(data: PspProcessDto): Promise<{
    transactionId: string;
    status: TransactionStatus;
    redirectUrl?: string;
  }> {
    const {
      cardNumber,
      callbackUrl,
      internalId,
      amount,
      currency,
      failureUrl,
    } = data;

    // Store transaction context for 3DS completion
    this.transactions.set(internalId, {
      amount,
      callbackUrl,
      currency,
      failureUrl,
    });

    // Simulateing 3DS flow
    if (cardNumber.startsWith("4111")) {
      return {
        transactionId: internalId,
        status: TransactionStatus.PENDING_3DS,
        redirectUrl: `${process.env.BASE_URL}/psp/3ds/${internalId}`,
      };
    } else if (cardNumber.startsWith("5555")) {
      await this.sendWebhook(callbackUrl, {
        transactionId: internalId,
        final_amount: data.amount,
        status: TransactionStatus.SUCCESS,
      });
      return {
        transactionId: internalId,
        status: TransactionStatus.SUCCESS,
      };
    } else if (cardNumber.startsWith("4000")) {
      await this.sendWebhook(callbackUrl, {
        transactionId: internalId,
        final_amount: data.amount,
        status: TransactionStatus.FAILED,
      });
      return {
        transactionId: internalId,
        status: TransactionStatus.FAILED,
      };
    } else {
      return {
        transactionId: internalId,
        status: TransactionStatus.FAILED,
      };
    }
  }

  async completePayment(transactionId: string) {
    const tx = this.transactions.get(transactionId);
    if (!tx) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // In a real scenario, app might verify the amount or status here.
    // but for this simulator, we assume success after 3D
    await this.sendWebhook(tx.callbackUrl, {
      transactionId: transactionId,
      final_amount: tx.amount,
      status: TransactionStatus.SUCCESS,
    });

    this.transactions.delete(transactionId);
  }

  async cancelPayment(transactionId: string) {
    const tx = this.transactions.get(transactionId);
    if (!tx) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // Send webhook to notfy FAILED status
    await this.sendWebhook(tx.callbackUrl, {
      transactionId: transactionId,
      final_amount: tx.amount,
      status: TransactionStatus.FAILED,
    });

    const failureUrl = tx.failureUrl;
    this.transactions.delete(transactionId);

    return failureUrl;
  }

  private async sendWebhook(url: string, payload: any) {
    try {
      setTimeout(async () => {
        await axios.post(url, payload);
      }, 500);
    } catch (err) {
      console.error("Failed to send webhook", err);
    }
  }
}

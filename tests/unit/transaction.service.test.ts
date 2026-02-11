import { describe, it, expect, vi, beforeEach } from "vitest";
import { ITransactionRepo } from "../../src/application/transaction.repo";
import { TransactionStatus, Currency } from "../../src/domain/enums";
import axios from "axios";
import { pool } from "../../src/api/plugins/db";
import { TransactionService } from "../../src/application/services/transaction/transaction.service";

vi.mock("axios");
vi.mock("../../src/api/plugins/db", () => ({
  pool: {
    connect: vi.fn(),
  },
}));

describe("TransactionService", () => {
  let transactionService: TransactionService;
  let mockRepo: ITransactionRepo;
  let mockDbClient: any;

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findByTransactionId: vi.fn(),
      findByIdAndLock: vi.fn(),
      updateStatus: vi.fn(),
    };
    transactionService = new TransactionService(mockRepo);
    mockDbClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    (pool.connect as any).mockResolvedValue(mockDbClient);
    vi.clearAllMocks();
  });

  describe("createTransaction", () => {
    it("should create a transaction and update status to SUCCESS when PSP returns SUCCESS", async () => {
      const payload = {
        amount: 100,
        currency: Currency.USD,
        cardNumber: "1234567812345678",
        orderId: "order-123",
        cvv: "123",
        cardExpiry: "12/26",
        callbackUrl: "http://cb",
        failureUrl: "http://fail",
      };

      const mockTx = {
        id: "tx-123",
        ...payload,
        status: TransactionStatus.CREATED,
      };

      (mockRepo.create as any).mockResolvedValue(mockTx);
      (axios.post as any).mockResolvedValue({
        data: {
          status: TransactionStatus.SUCCESS,
          transactionId: "psp-tx-123",
        },
      });

      const result = await transactionService.createTransaction(payload);

      expect(mockRepo.create).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalled();
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(
        "tx-123",
        TransactionStatus.SUCCESS,
        100,
        "psp-tx-123",
      );
      expect(result.status).toBe(TransactionStatus.SUCCESS);
    });

    it("should handle PSP failure", async () => {
      const payload = {
        amount: 100,
        currency: Currency.USD,
        cardNumber: "1234567812345678",
        orderId: "order-123",
        cvv: "123",
        cardExpiry: "12/26",
        callbackUrl: "http://cb",
        failureUrl: "http://fail",
      };

      const mockTx = {
        id: "tx-123",
        ...payload,
        status: TransactionStatus.CREATED,
      };

      (mockRepo.create as any).mockResolvedValue(mockTx);
      (axios.post as any).mockResolvedValue({
        data: {
          status: TransactionStatus.FAILED,
          transactionId: "psp-tx-123",
        },
      });

      const result = await transactionService.createTransaction(payload);

      expect(mockRepo.updateStatus).toHaveBeenCalledWith(
        "tx-123",
        TransactionStatus.FAILED,
        100,
        "psp-tx-123",
      );
      expect(result.status).toBe(TransactionStatus.FAILED);
    });
  });

  describe("handleWebhook", () => {
    it("should update transaction status on valid transition", async () => {
      const payload = {
        transactionId: "psp-tx-123",
        status: TransactionStatus.SUCCESS,
        final_amount: 100,
      };

      const mockTx = {
        id: "tx-123",
        status: TransactionStatus.PENDING_3DS,
      };

      (mockRepo.findByTransactionId as any).mockResolvedValue(mockTx);

      await transactionService.handleWebhook(payload);

      expect(mockDbClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(
        "tx-123",
        TransactionStatus.SUCCESS,
        100,
      );
      expect(mockDbClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("should be idempotent (ignore repeat webhooks for terminal state)", async () => {
      const payload = {
        transactionId: "psp-tx-123",
        status: TransactionStatus.SUCCESS,
        final_amount: 100,
      };

      const mockTx = {
        id: "tx-123",
        status: TransactionStatus.SUCCESS,
      };

      (mockRepo.findByTransactionId as any).mockResolvedValue(mockTx);

      await transactionService.handleWebhook(payload);

      expect(mockDbClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
      expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    });

    it("should throw error on invalid transition", async () => {
      const payload = {
        transactionId: "psp-tx-123",
        status: TransactionStatus.CREATED,
        final_amount: 100,
      };

      const mockTx = {
        id: "tx-123",
        status: TransactionStatus.PENDING_3DS,
      };

      (mockRepo.findByTransactionId as any).mockResolvedValue(mockTx);

      await expect(transactionService.handleWebhook(payload)).rejects.toThrow();

      expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });
});

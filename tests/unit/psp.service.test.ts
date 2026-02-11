import { describe, it, expect, vi, beforeEach } from "vitest";
import { PSPService } from "../../src/application/services/psp/psp.service";
import { TransactionStatus, Currency } from "../../src/domain/enums";

vi.mock("axios");

describe("PSPService", () => {
  let service: PSPService;

  beforeEach(() => {
    service = new PSPService();
    vi.clearAllMocks();
  });

  describe("processTransaction", () => {
    it("should return PENDING_3DS for card starting with 4111", async () => {
      const payload = {
        cardNumber: "4111000000000000",
        amount: 100,
        currency: Currency.USD,
        callbackUrl: "http://callback",
        internalId: "tx-123",
        failureUrl: "http://failure",
        transactionId: "tx-123",
        cardExpiry: "12/25",
        cvv: "123",
        orderId: "ord-123",
      };

      const result = await service.processTransaction(payload);

      expect(result.status).toBe(TransactionStatus.PENDING_3DS);
      expect(result.redirectUrl).toContain("/psp/3ds/tx-123");
    });

    it("should return SUCCESS and trigger webhook for card starting with 5555", async () => {
      const payload = {
        cardNumber: "5555000000000000",
        amount: 100,
        currency: Currency.USD,
        callbackUrl: "http://callback",
        internalId: "tx-123",
        failureUrl: "http://failure",
        transactionId: "tx-123",
        cardExpiry: "12/25",
        cvv: "123",
        orderId: "ord-123",
      };

      const result = await service.processTransaction(payload);

      expect(result.status).toBe(TransactionStatus.SUCCESS);
    });

    it("should return FAILED and trigger webhook for card starting with 4000", async () => {
      const payload = {
        cardNumber: "4000000000000000",
        amount: 100,
        currency: Currency.USD,
        callbackUrl: "http://callback",
        internalId: "tx-123",
        failureUrl: "http://failure",
        transactionId: "tx-123",
        cardExpiry: "12/25",
        cvv: "123",
        orderId: "ord-123",
      };

      const result = await service.processTransaction(payload);

      expect(result.status).toBe(TransactionStatus.FAILED);
    });

    it("should return FAILED for unknown cards", async () => {
      const payload = {
        cardNumber: "1234000000000000",
        amount: 100,
        currency: Currency.USD,
        callbackUrl: "http://callback",
        internalId: "tx-123",
        failureUrl: "http://failure",
        transactionId: "tx-123",
        cardExpiry: "12/25",
        cvv: "123",
        orderId: "ord-123",
      };

      const result = await service.processTransaction(payload);

      expect(result.status).toBe(TransactionStatus.FAILED);
    });
  });

  describe("completePayment", () => {
    it("should successfully complete payment if transaction exists", async () => {
      const payload = {
        cardNumber: "4111000000000000",
        amount: 100,
        currency: Currency.USD,
        callbackUrl: "http://callback",
        internalId: "tx-123",
        failureUrl: "http://failure",
        transactionId: "tx-123",
        cardExpiry: "12/25",
        cvv: "123",
        orderId: "ord-123",
      };
      await service.processTransaction(payload);

      await expect(service.completePayment("tx-123")).resolves.not.toThrow();
    });

    it("should throw error if transaction not found", async () => {
      await expect(service.completePayment("tx-not-exists")).rejects.toThrow(
        "Transaction tx-not-exists not found",
      );
    });
  });

  describe("cancelPayment", () => {
    it("should successfully cancel payment and return failureUrl", async () => {
      const payload = {
        cardNumber: "4111000000000000",
        amount: 100,
        currency: Currency.USD,
        callbackUrl: "http://callback",
        internalId: "tx-123",
        failureUrl: "http://failure",
        transactionId: "tx-123",
        cardExpiry: "12/25",
        cvv: "123",
        orderId: "ord-123",
      };
      await service.processTransaction(payload);

      const result = await service.cancelPayment("tx-123");
      expect(result).toBe("http://failure");
    });

    it("should throw error if transaction not found", async () => {
      await expect(service.cancelPayment("tx-not-exists")).rejects.toThrow(
        "Transaction tx-not-exists not found",
      );
    });
  });
});

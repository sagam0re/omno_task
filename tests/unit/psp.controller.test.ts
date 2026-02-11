import { describe, it, expect, vi, beforeEach } from "vitest";
import { PspController } from "../../src/api/controllers/psp.controller";
import { IPSPService } from "../../src/application/services/psp/psp.interface";
import { FastifyReply, FastifyRequest } from "fastify";
import { TransactionStatus } from "../../src/domain/enums";

describe("PspController", () => {
  let controller: PspController;
  let mockService: IPSPService;
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockService = {
      processTransaction: vi.fn(),
      completePayment: vi.fn(),
      cancelPayment: vi.fn(),
    };
    controller = new PspController(mockService);

    mockRequest = {
      body: {},
      params: {},
      log: {
        error: vi.fn(),
      },
    };

    mockReply = {
      send: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      type: vi.fn().mockReturnThis(),
    };
  });

  describe("process", () => {
    it("should process transaction successfully", async () => {
      const payload = {
        amount: 100,
        currency: "USD",
        cardNumber: "1234",
        callbackUrl: "http://callback",
        internalId: "tx-123",
        failureUrl: "http://failure",
      };
      mockRequest.body = payload;
      const expectedResult = {
        transactionId: "tx-123",
        status: TransactionStatus.SUCCESS,
      };

      (mockService.processTransaction as any).mockResolvedValue(expectedResult);

      await controller.process(
        mockRequest as FastifyRequest<any>,
        mockReply as FastifyReply,
      );

      expect(mockService.processTransaction).toHaveBeenCalledWith(payload);
      expect(mockReply.send).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle errors", async () => {
      const error = new Error("Processing failed");
      (mockService.processTransaction as any).mockRejectedValue(error);

      await controller.process(
        mockRequest as FastifyRequest<any>,
        mockReply as FastifyReply,
      );

      expect(mockRequest.log.error).toHaveBeenCalledWith(error);
      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith(error);
    });
  });

  describe("handle3ds", () => {
    it("should return HTML content", async () => {
      mockRequest.params = { id: "tx-123" };

      await controller.handle3ds(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockReply.type).toHaveBeenCalledWith("text/html");
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.stringContaining("<html>"),
      );
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.stringContaining("tx-123"),
      );
    });

    it("should handle errors", async () => {
      mockRequest.params = {};
      // Start of mock implementation that throws isn't easy for this simple method,
      // but let's assume something goes wrong with params access if strictly typed or some other error.
      // For this test, let's force an error by mocking request.params to throw? No, that's hard in JS.
      // Let's just manually trigger the catch block if possible, or skip if the code is too simple to fail.
      // Actually, the catch block is there. Let's try to pass undefined params if possible or modify the test to simulate error.
      // But wait, the controller code: `const { id } = request.params as { id: string };`
      // If request.params is undefined/null, it might throw.
      mockRequest.params = null;

      await controller.handle3ds(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      // It might throw "Cannot destructure property 'id' of 'request.params' as it is null."
      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.code).toHaveBeenCalledWith(500);
    });
  });

  describe("paymentComplete", () => {
    it("should complete payment and return success HTML", async () => {
      mockRequest.body = { transactionId: "tx-123" };

      await controller.paymentComplete(
        mockRequest as FastifyRequest<any>,
        mockReply as FastifyReply,
      );

      expect(mockService.completePayment).toHaveBeenCalledWith("tx-123");
      expect(mockReply.type).toHaveBeenCalledWith("text/html");
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.stringContaining("Payment Complete"),
      );
    });

    it("should handle errors and return failure HTML", async () => {
      mockRequest.body = { transactionId: "tx-invalid" };
      (mockService.completePayment as any).mockRejectedValue(
        new Error("Not found"),
      );

      await controller.paymentComplete(
        mockRequest as FastifyRequest<any>,
        mockReply as FastifyReply,
      );

      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.type).toHaveBeenCalledWith("text/html");
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.stringContaining("Payment Failed"),
      );
    });
  });

  describe("paymentCancel", () => {
    it("should cancel payment and return redirect URL", async () => {
      mockRequest.body = { transactionId: "tx-123" };
      const failureUrl = "http://failure.com";
      (mockService.cancelPayment as any).mockResolvedValue(failureUrl);

      await controller.paymentCancel(
        mockRequest as FastifyRequest<any>,
        mockReply as FastifyReply,
      );

      expect(mockService.cancelPayment).toHaveBeenCalledWith("tx-123");
      expect(mockReply.send).toHaveBeenCalledWith({ redirectUrl: failureUrl });
    });

    it("should handle errors", async () => {
      mockRequest.body = { transactionId: "tx-invalid" };
      const error = new Error("Cancellation failed");
      (mockService.cancelPayment as any).mockRejectedValue(error);

      await controller.paymentCancel(
        mockRequest as FastifyRequest<any>,
        mockReply as FastifyReply,
      );

      expect(mockRequest.log.error).toHaveBeenCalled();
      expect(mockReply.code).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: "Failed to cancel payment",
        message: error.message,
      });
    });
  });
});

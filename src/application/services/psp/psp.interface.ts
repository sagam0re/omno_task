import { Psp3dsDto, PspProcessDto, PspResponseDto } from "../dto/psp.dto";

export interface IPSPService {
  processTransaction: (payload: PspProcessDto) => Promise<PspResponseDto>;
  completePayment: (transactionId: string) => Promise<void>;
  cancelPayment: (transactionId: string) => Promise<string | void>;
}

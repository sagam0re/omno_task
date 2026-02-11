import { TransactionStatus } from "./enums";

export class TransactionStateMachine {
  private static allowedTransitions: Record<
    TransactionStatus,
    TransactionStatus[]
  > = {
    [TransactionStatus.CREATED]: [
      TransactionStatus.PENDING_3DS,
      TransactionStatus.SUCCESS,
      TransactionStatus.FAILED,
    ],
    [TransactionStatus.PENDING_3DS]: [
      TransactionStatus.SUCCESS,
      TransactionStatus.FAILED,
    ],
    [TransactionStatus.SUCCESS]: [],
    [TransactionStatus.FAILED]: [],
  };

  static validateTransition(
    current: TransactionStatus,
    next: TransactionStatus,
  ): void {
    const allowed = this.allowedTransitions[current];
    if (!allowed || !allowed.includes(next)) {
      throw new Error(`Invalid state transition: ${current} -> ${next}`);
    }
  }

  static isTerminal(status: TransactionStatus): boolean {
    return [TransactionStatus.SUCCESS, TransactionStatus.FAILED].includes(
      status,
    );
  }
}

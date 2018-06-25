import { ITransaction } from './Transaction';

export interface IP2PServer {
  broadcastClearTransactions(): void;
  broadcastTransaction(transaction: ITransaction): void;
  listen(): void;
  synchronizeChains(): void;
}

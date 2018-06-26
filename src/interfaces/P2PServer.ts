import { ITransaction } from './Transaction';

export interface IP2PServer {
  broadcastAddress(address: string): void;
  broadcastClearTransactions(): void;
  broadcastTransaction(transaction: ITransaction): void;
  listen(): void;
  synchronizeChains(): void;
}

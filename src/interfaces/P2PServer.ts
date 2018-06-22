import { ITransaction } from './Transaction';

export interface IP2PServer {
  broadcastTransaction(transaction: ITransaction): void;
  listen(): void;
  synchronizeChains(): void;
}

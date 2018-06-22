import { TransactionModel } from './TransactionModel';

export interface P2PServerModel {
  broadcastTransaction(transaction: TransactionModel): void;
  listen(): void;
  synchronizeChains(): void;
}

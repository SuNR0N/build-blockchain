import { TransactionModel } from './TransactionModel';

export interface TransactionPoolModel {
  transactions: TransactionModel[];

  updateOrAddTransaction(transaction: TransactionModel): void;
}

import { TransactionModel } from './TransactionModel';

export interface TransactionPoolModel {
  transactions: TransactionModel[];

  existingTransaction(address: string): TransactionModel | undefined;
  updateOrAddTransaction(transaction: TransactionModel): void;
}

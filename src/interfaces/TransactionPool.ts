import { ITransaction } from './Transaction';

export interface ITransactionPool {
  transactions: ITransaction[];

  clear(): void;
  existingTransaction(address: string): ITransaction | undefined;
  updateOrAddTransaction(transaction: ITransaction): void;
  validTransactions(): ITransaction[];
}

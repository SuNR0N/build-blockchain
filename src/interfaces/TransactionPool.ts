import { ITransaction } from './Transaction';

export interface ITransactionPool {
  transactions: ITransaction[];

  existingTransaction(address: string): ITransaction | undefined;
  updateOrAddTransaction(transaction: ITransaction): void;
  validTransactions(): ITransaction[];
}

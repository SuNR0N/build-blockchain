import {
  ITransaction,
  ITransactionPool,
} from '../interfaces';

export class TransactionPool implements ITransactionPool {
  public transactions: ITransaction[];

  constructor() {
    this.transactions = [];
  }

  public existingTransaction(address: string): ITransaction | undefined {
    return this.transactions.find((transaction) => transaction.input!.address === address);
  }

  public updateOrAddTransaction(transaction: ITransaction): void {
    const transactionIndex = this.transactions
      .findIndex((existingTransaction) => existingTransaction.id === transaction.id);

    if (transactionIndex === -1) {
      this.transactions.push(transaction);
    } else {
      this.transactions[transactionIndex] = transaction;
    }
  }
}

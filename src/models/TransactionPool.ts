import {
  TransactionModel,
  TransactionPoolModel,
} from '../interfaces';

export class TransactionPool implements TransactionPoolModel {
  public transactions: TransactionModel[];

  constructor() {
    this.transactions = [];
  }

  public updateOrAddTransaction(transaction: TransactionModel): void {
    const transactionIndex = this.transactions
      .findIndex((existingTransaction) => existingTransaction.id === transaction.id);

    if (transactionIndex === -1) {
      this.transactions.push(transaction);
    } else {
      this.transactions[transactionIndex] = transaction;
    }
  }
}

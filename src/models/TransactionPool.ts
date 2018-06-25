import {
  ITransaction,
  ITransactionPool,
} from '../interfaces';
import { logger } from '../utils/Logger';
import { Transaction } from './Transaction';

export class TransactionPool implements ITransactionPool {
  public transactions: ITransaction[];

  constructor() {
    this.transactions = [];
  }

  public clear(): void {
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

  public validTransactions(): ITransaction[] {
    return this.transactions.filter((transaction) => {
      const outputTotal = transaction.outputs.reduce((previous, current) => {
        previous += current.amount;
        return previous;
      }, 0);

      if (transaction.input!.amount !== outputTotal) {
        logger.warn(`Invalid transaction (${transaction.id}) from ${transaction.input!.address}.`);
        return false;
      }

      if (!Transaction.verifyTransaction(transaction)) {
        logger.warn(`Invalid signature for transaction (${transaction.id}) from ${transaction.input!.address}.`);
        return false;
      }

      return true;
    });
  }
}

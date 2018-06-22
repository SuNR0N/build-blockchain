import {
  KeyPair,
  Signature,
} from 'elliptic';

import { INITIAL_BALANCE } from '../config';
import {
  TransactionPoolModel,
  WalletModel,
} from '../interfaces';
import { ChainUtils } from '../utils/ChainUtils';
import { Transaction } from './Transaction';

export class Wallet implements WalletModel {
  public balance: number;
  public keyPair: KeyPair;
  public publicKey: string;

  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtils.generateKeyPair();
    this.publicKey = this.keyPair.getPublic('hex');
  }

  public toString(): string {
    return `Wallet -
      ${'Balance'.padEnd(10)}: ${this.balance}
      ${'Public Key'.padEnd(10)}: ${this.publicKey}`;
  }

  public sign(dataHash: string): Signature {
    return this.keyPair.sign(dataHash);
  }

  public createTransaction(recipient: string, amount: number, transactionPool: TransactionPoolModel) {
    if (amount > this.balance) {
      // tslint:disable-next-line:no-console
      console.log(`Transferable amount (${amount}) exceeds current balance (${this.balance}).`);
      return;
    }

    let transaction = transactionPool.existingTransaction(this.publicKey);

    if (transaction) {
      transaction.update(this, recipient, amount);
    } else {
      transaction = Transaction.newTransaction(this, recipient, amount)!;
      transactionPool.updateOrAddTransaction(transaction);
    }
  }
}

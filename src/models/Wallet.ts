import {
  KeyPair,
  Signature,
} from 'elliptic';

import { INITIAL_BALANCE } from '../config';
import {
  ITransaction,
  ITransactionPool,
  IWallet,
} from '../interfaces';
import { ChainUtils } from '../utils/ChainUtils';
import { Transaction } from './Transaction';

export class Wallet implements IWallet {
  public static blockchainWallet(): IWallet {
    const blockchainWallet = new this();
    blockchainWallet.publicKey = 'blockchain-wallet';

    return blockchainWallet;
  }

  public balance: number;
  public keyPair: KeyPair;
  public publicKey: string;

  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtils.generateKeyPair();
    this.publicKey = this.keyPair.getPublic('hex');
  }

  // tslint:disable-next-line:max-line-length
  public createTransaction(recipient: string, amount: number, transactionPool: ITransactionPool): ITransaction | undefined {
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

    return transaction;
  }

  public sign(dataHash: string): Signature {
    return this.keyPair.sign(dataHash);
  }

  public toString(): string {
    return `Wallet -
      ${'Balance'.padEnd(10)}: ${this.balance}
      ${'Public Key'.padEnd(10)}: ${this.publicKey}`;
  }
}

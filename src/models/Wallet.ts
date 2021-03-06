import {
  KeyPair,
  Signature,
} from 'elliptic';

import { INITIAL_BALANCE } from '../config';
import {
  IBlockchain,
  ITransaction,
  ITransactionOutput,
  ITransactionPool,
  IWallet,
} from '../interfaces';
import { ChainUtils } from '../utils/ChainUtils';
import {
  InsufficientFundsError,
  Transaction,
} from './';

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

  public calculateBalance(blockchain: IBlockchain<ITransaction[]>): number {
    const transactions: ITransaction[] = [];
    blockchain.chain.forEach((block) => {
      if (Array.isArray(block.data)) {
        block.data.forEach((transaction) => transactions.push(transaction));
      }
    });
    let balance = this.balance;

    const recentInputTransaction = transactions
      .filter((transaction) => transaction.input!.address === this.publicKey)
      .sort((t1, t2) => t2.input!.timestamp - t1.input!.timestamp)[0];
    let startTime = 0;
    if (recentInputTransaction) {
      const recentOutput = recentInputTransaction.outputs.find((output) => output.address === this.publicKey)!;
      balance = recentOutput.amount;
      startTime = recentInputTransaction.input!.timestamp;
    }

    const income: number = transactions
      .filter((transaction) => transaction.input!.timestamp > startTime)
      .reduce((previous, current) => {
        previous = previous.concat(current.outputs);
        return previous;
      }, new Array<ITransactionOutput>())
      .filter((output) => output.address === this.publicKey)
      .reduce((previous, current) => {
        previous += current.amount;
        return previous;
      }, 0);

    balance += income;

    return balance;
  }

  // tslint:disable-next-line:max-line-length
  public createTransaction(recipient: string, amount: number, blockchain: IBlockchain, transactionPool: ITransactionPool): ITransaction {
    this.balance = this.calculateBalance(blockchain);

    if (amount > this.balance) {
      throw new InsufficientFundsError(`Transferable amount (${amount}) exceeds current balance (${this.balance}).`);
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

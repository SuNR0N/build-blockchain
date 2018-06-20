import {
  TransactionModel,
  TransactionOutputModel,
} from '../interfaces/TransactionModel';
import { ChainUtils } from '../utils/ChainUtils';
import { Wallet } from './Wallet';

export class Transaction implements TransactionModel {
  public static newTransaction(senderWallet: Wallet, recipient: string, amount: number): Transaction | undefined {
    const transaction = new this();

    if (amount > senderWallet.balance) {
      // tslint:disable-next-line:no-console
      console.log(`Transferable amount (${amount}) exceeds sender's balance.`);
      return;
    }

    const remaining: TransactionOutputModel = {
      address: senderWallet.publicKey,
      amount: senderWallet.balance - amount,
    };
    const spent: TransactionOutputModel = {
      address: recipient,
      amount,
    };

    transaction.outputs.push(remaining, spent);

    return transaction;
  }

  public id: string;
  public input: any;
  public outputs: TransactionOutputModel[];

  constructor() {
    this.id = ChainUtils.id();
    this.input = null;
    this.outputs = [];
  }
}

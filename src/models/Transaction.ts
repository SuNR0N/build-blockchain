import {
  TransactionInputModel,
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
    Transaction.signTransaction(transaction, senderWallet);

    return transaction;
  }

  public static signTransaction(transaction: Transaction, senderWallet: Wallet): void {
    transaction.input = {
      address: senderWallet.publicKey,
      amount: senderWallet.balance,
      signature: senderWallet.sign(ChainUtils.hash(transaction.outputs)),
      timestamp: Date.now(),
    };
  }

  public id: string;
  public input: TransactionInputModel | null;
  public outputs: TransactionOutputModel[];

  constructor() {
    this.id = ChainUtils.id();
    this.input = null;
    this.outputs = [];
  }
}

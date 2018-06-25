import { MINING_REWARD } from '../config';
import {
  ITransaction,
  ITransactionInput,
  ITransactionOutput,
  IWallet,
} from '../interfaces';
import {
  ChainUtils,
  logger,
} from '../utils';

export class Transaction implements ITransaction {
  public static newTransaction(senderWallet: IWallet, recipient: string, amount: number): ITransaction | undefined {
    if (amount > senderWallet.balance) {
      logger.warn(`Transferable amount (${amount}) exceeds sender's balance.`);
      return;
    }

    const remaining: ITransactionOutput = {
      address: senderWallet.publicKey,
      amount: senderWallet.balance - amount,
    };
    const spent: ITransactionOutput = {
      address: recipient,
      amount,
    };

    return Transaction.transactionWithOutputs(senderWallet, remaining, spent);
  }

  public static rewardTransaction(minerWallet: IWallet, blockchainWallet: IWallet): ITransaction {
    const reward: ITransactionOutput = {
      address: minerWallet.publicKey,
      amount: MINING_REWARD,
    };
    return Transaction.transactionWithOutputs(blockchainWallet, reward);
  }

  public static signTransaction(transaction: ITransaction, senderWallet: IWallet): void {
    transaction.input = {
      address: senderWallet.publicKey,
      amount: senderWallet.balance,
      signature: senderWallet.sign(ChainUtils.hash(transaction.outputs)),
      timestamp: Date.now(),
    };
  }

  public static transactionWithOutputs(senderWallet: IWallet, ...outputs: ITransactionOutput[]): ITransaction {
    const transaction = new this();
    transaction.outputs.push(...outputs);
    Transaction.signTransaction(transaction, senderWallet);

    return transaction;
  }

  public static verifyTransaction(transaction: ITransaction): boolean {
    return ChainUtils.verifySignature(
      transaction.input!.address,
      transaction.input!.signature,
      ChainUtils.hash(transaction.outputs),
    );
  }

  public id: string;
  public input: ITransactionInput | null;
  public outputs: ITransactionOutput[];

  private constructor() {
    this.id = ChainUtils.id();
    this.input = null;
    this.outputs = [];
  }

  public update(senderWallet: IWallet, recipient: string, amount: number): ITransaction | undefined {
    const senderOutput = this.outputs.find((output) => output.address === senderWallet.publicKey)!;

    if (amount > senderOutput.amount) {
      logger.warn(`Transferable amount (${amount}) exceeds sender's balance.`);
      return;
    }

    senderOutput.amount = senderOutput.amount - amount;
    const spent: ITransactionOutput = {
      address: recipient,
      amount,
    };
    this.outputs.push(spent);

    Transaction.signTransaction(this, senderWallet);

    return this;
  }
}

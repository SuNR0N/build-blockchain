import { Signature } from 'elliptic';
import { WalletModel } from './WalletModel';

export interface TransactionModel {
  id: string;
  input: TransactionInputModel | null;
  outputs: TransactionOutputModel[];

  update(senderWallet: WalletModel, recipient: string, amount: number): TransactionModel | undefined;
}

export interface TransactionInputModel {
  timestamp: number;
  amount: number;
  address: string;
  signature: Signature;
}

export interface TransactionOutputModel {
  address: string;
  amount: number;
}

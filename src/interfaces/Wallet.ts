import {
  KeyPair,
  Signature,
} from 'elliptic';

import { ITransactionPool } from './TransactionPool';

export interface IWallet {
  balance: number;
  keyPair: KeyPair;
  publicKey: string;

  createTransaction(recipient: string, amount: number, transactionPool: ITransactionPool): void;
  sign(dataHash: string): Signature;
  toString(): string;
}

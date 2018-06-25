import {
  KeyPair,
  Signature,
} from 'elliptic';

import {
  ITransaction,
  ITransactionPool,
} from './';

export interface IWallet {
  balance: number;
  keyPair: KeyPair;
  publicKey: string;

  createTransaction(recipient: string, amount: number, transactionPool: ITransactionPool): ITransaction | undefined;
  sign(dataHash: string): Signature;
  toString(): string;
}

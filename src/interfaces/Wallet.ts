import {
  KeyPair,
  Signature,
} from 'elliptic';

import {
  IBlockchain,
  ITransaction,
  ITransactionPool,
} from './';

export interface IWallet {
  balance: number;
  keyPair: KeyPair;
  publicKey: string;

  calculateBalance(blockchain: IBlockchain<ITransaction[]>): number;
  // tslint:disable-next-line:max-line-length
  createTransaction(recipient: string, amount: number, blockchain: IBlockchain, transactionPool: ITransactionPool): ITransaction;
  sign(dataHash: string): Signature;
  toString(): string;
}

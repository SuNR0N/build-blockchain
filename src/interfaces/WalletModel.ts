import { KeyPair } from 'elliptic';

export interface WalletModel {
  balance: number;
  keyPair: KeyPair;
  publicKey: string;
}

import {
  KeyPair,
  Signature,
} from 'elliptic';

export interface WalletModel {
  balance: number;
  keyPair: KeyPair;
  publicKey: string;

  sign(dataHash: string): Signature;
}

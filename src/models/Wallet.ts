import { KeyPair } from 'elliptic';

import { INITIAL_BALANCE } from '../config';
import { WalletModel } from '../interfaces/WalletModel';
import { ChainUtils } from '../utils/ChainUtils';

export class Wallet implements WalletModel {
  public balance: number;
  public keyPair: KeyPair;
  public publicKey: string;

  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtils.generateKeyPair();
    this.publicKey = this.keyPair.getPublic('hex');
  }

  public toString(): string {
    return `Wallet -
      ${'Balance'.padEnd(10)}: ${this.balance}
      ${'Public Key'.padEnd(10)}: ${this.publicKey}`;
  }
}

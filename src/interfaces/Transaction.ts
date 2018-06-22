import { Signature } from 'elliptic';

import { IWallet } from './Wallet';

export interface ITransaction {
  id: string;
  input: ITransactionInput | null;
  outputs: ITransactionOutput[];

  update(senderWallet: IWallet, recipient: string, amount: number): ITransaction | undefined;
}

export interface ITransactionInput {
  address: string;
  amount: number;
  signature: Signature;
  timestamp: number;
}

export interface ITransactionOutput {
  address: string;
  amount: number;
}

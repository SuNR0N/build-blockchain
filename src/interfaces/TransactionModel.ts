import { Signature } from 'elliptic';

export interface TransactionModel {
  id: string;
  input: TransactionInputModel | null;
  outputs: TransactionOutputModel[];
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

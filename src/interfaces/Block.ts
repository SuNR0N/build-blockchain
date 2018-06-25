import { ITransaction } from './Transaction';

export interface IBlock<T = ITransaction[]> {
  data: T | null;
  difficulty: number;
  hash: string;
  lastHash: string;
  nonce: number;
  timestamp: number;

  toString(): string;
}

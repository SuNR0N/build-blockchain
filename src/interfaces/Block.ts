export interface IBlock<T> {
  data: T | null;
  difficulty: number;
  hash: string;
  lastHash: string;
  nonce: number;
  timestamp: number;

  toString(): string;
}

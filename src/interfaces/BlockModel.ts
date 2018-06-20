export interface BlockModel<T> {
  data: T | null;
  difficulty: number;
  hash: string;
  lastHash: string;
  nonce: number;
  timestamp: number;
}

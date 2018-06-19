export interface BlockModel<T> {
  data: T | null;
  hash: string;
  lastHash: string;
  timestamp: number;
}

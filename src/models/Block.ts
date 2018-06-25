import {
  DIFFICULTY,
  MINE_RATE,
} from '../config';
import {
  IBlock,
  ITransaction,
} from '../interfaces';
import { ChainUtils } from '../utils/ChainUtils';

export class Block<T = ITransaction[]> implements IBlock<T> {
  public static adjustDifficulty<T>(lastBlock: IBlock<T>, currentTimestamp: number): number {
    const { timestamp: previousTimestamp } = lastBlock;
    let { difficulty } = lastBlock;
    difficulty = previousTimestamp + MINE_RATE > currentTimestamp ? difficulty + 1 : difficulty - 1;

    return difficulty;
  }

  public static blockHash<T>(block: IBlock<T>): string {
    const {
      data,
      difficulty,
      lastHash,
      nonce,
      timestamp,
    } = block;
    return Block.hash<T>(timestamp, lastHash, data!, nonce, difficulty);
  }

  public static genesis<T>(): IBlock<T> {
    return new this<T>(
      Date.now(),
      '0'.repeat(10),
      'f1r57-h45h',
      null,
      0,
      DIFFICULTY,
    );
  }

  public static hash<T>(timestamp: number, lastHash: string, data: T, nonce: number, difficulty: number): string {
    return ChainUtils.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`);
  }

  public static mineBlock<T>(lastBlock: IBlock<T>, data: T): IBlock<T> {
    const { hash: lastHash } = lastBlock;
    let { difficulty } = lastBlock;
    let hash: string;
    let nonce: number = -1;
    let timestamp: number;

    do {
      timestamp = Date.now();
      nonce++;
      difficulty = Block.adjustDifficulty<T>(lastBlock, timestamp);
      hash = Block.hash<T>(timestamp, lastHash, data, nonce, difficulty);
    } while (!hash.startsWith('0'.repeat(difficulty)));

    return new this<T>(timestamp, lastHash, hash, data, nonce, difficulty);
  }

  constructor(
    public timestamp: number = Date.now(),
    public lastHash: string = '',
    public hash: string = '',
    public data: T | null = null,
    public nonce: number = 0,
    public difficulty: number = DIFFICULTY,
  ) { }

  public toString(): string {
    return `Block -
      ${'Difficulty'.padEnd(10)}: ${this.difficulty}
      ${'Hash'.padEnd(10)}: ${this.hash}
      ${'Last Hash'.padEnd(10)}: ${this.lastHash}
      ${'Nonce'.padEnd(10)}: ${this.nonce}
      ${'Timestamp'.padEnd(10)}: ${this.timestamp}
      ${'Data'.padEnd(10)}: ${this.data}`;
  }
}

import { SHA256 } from 'crypto-js';

import { BlockModel } from '../interfaces';

export class Block<T> implements BlockModel<T> {
  public static blockHash<T>(block: Block<T>): string {
    const {
      timestamp,
      lastHash,
      data,
    } = block;
    return Block.hash<T>(timestamp, lastHash, data!);
  }

  public static genesis<T>(): Block<T> {
    return new this<T>(
      Date.now(),
      '0'.repeat(10),
      'f1r57-h45h',
      null,
    );
  }

  public static mineBlock<T>(lastBlock: Block<T>, data: T): Block<T> {
    const timestamp = Date.now();
    const lashHash = lastBlock.hash;
    const hash = Block.hash<T>(timestamp, lashHash, data);

    return new this<T>(timestamp, lashHash, hash, data);
  }

  public static hash<T>(timestamp: number, lastHash: string, data: T) {
    return SHA256(`${timestamp}${lastHash}${data}`).toString();
  }

  constructor(
    public timestamp: number = Date.now(),
    public lastHash: string = '',
    public hash: string = '',
    public data: T | null = null,
  ) { }

  public toString() {
    return `Block -
      ${'Timestamp'.padEnd(10)}: ${this.timestamp}
      ${'Last Hash'.padEnd(10)}: ${this.lastHash}
      ${'Hash'.padEnd(10)}: ${this.hash}
      ${'Data'.padEnd(10)}: ${this.data}`;
  }
}

import {
  IBlock,
  IBlockchain,
  ITransaction,
} from '../interfaces';
import { logger } from '../utils/Logger';
import { Block } from './Block';

export class Blockchain<T = ITransaction[]> implements IBlockchain<T> {
  public chain: Array<IBlock<T>>;

  constructor() {
    this.chain = [Block.genesis<T>()];
  }

  public addBlock(data: T): IBlock<T> {
    const newBlock = Block.mineBlock<T>(this.getLastBlock(), data);
    this.chain = [
      ...this.chain,
      newBlock,
    ];
    return newBlock;
  }

  public getGenesisBlock(): IBlock<T> {
    return this.chain[0];
  }

  public getLastBlock(): IBlock<T> {
    return this.chain[this.chain.length - 1];
  }

  public isValidChain(chain: Array<IBlock<T>>): boolean {
    const {
      timestamp: otherTimestamp,
      ...otherGenesisBlock
    } = chain[0];
    const {
      timestamp,
      ...genesisBlock
    } = this.getGenesisBlock();

    if (JSON.stringify(otherGenesisBlock) !== JSON.stringify(genesisBlock)) {
      return false;
    }

    return chain.every((currentBlock, index, arr) => {
      const previousBlock = arr[index - 1];

      return (
        previousBlock === undefined ||
        currentBlock.lastHash === previousBlock.hash &&
        currentBlock.hash === Block.blockHash(currentBlock)
      );
    });
  }

  public replaceChain(chain: Array<IBlock<T>>): void {
    if (chain.length <= this.chain.length) {
      logger.info('Received chain is not longer than the current chain.');
      return;
    } else if (!this.isValidChain(chain)) {
      logger.warn('Received chain is not valid.');
      return;
    }

    logger.info('Replacing blockchain with the new chain.');
    this.chain = chain;
  }
}

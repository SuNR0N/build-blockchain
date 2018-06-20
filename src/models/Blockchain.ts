import { BlockchainModel } from '../interfaces';
import { Block } from './Block';

export class Blockchain<T> implements BlockchainModel<T> {
  public chain: Array<Block<T>>;

  constructor() {
    this.chain = [Block.genesis<T>()];
  }

  public addBlock(data: T): Block<T> {
    const newBlock = Block.mineBlock<T>(this.getLastBlock(), data);
    this.chain = [
      ...this.chain,
      newBlock,
    ];
    return newBlock;
  }

  public getGenesisBlock(): Block<T> {
    return this.chain[0];
  }

  public getLastBlock(): Block<T> {
    return this.chain[this.chain.length - 1];
  }

  public isValidChain(chain: Array<Block<T>>): boolean {
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

  public replaceChain(chain: Array<Block<T>>): void {
    // tslint:disable:no-console
    if (chain.length <= this.chain.length) {
      console.log('Received chain is not longer than the current chain.');
      return;
    } else if (!this.isValidChain(chain)) {
      console.log('Received chain is not valid.');
      return;
    }

    console.log('Replacing blockchain with the new chain.');
    this.chain = chain;
    // tslint:enable:no-console
  }
}

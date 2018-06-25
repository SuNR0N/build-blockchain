import {
  IBlock,
  ITransaction,
} from './';

export interface IBlockchain<T = ITransaction[]> {
  chain: Array<IBlock<T>>;

  addBlock(data: T): IBlock<T>;
  getGenesisBlock(): IBlock<T>;
  getLastBlock(): IBlock<T>;
  isValidChain(chain: Array<IBlock<T>>): boolean;
  replaceChain(chain: Array<IBlock<T>>): void;
}

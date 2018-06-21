import { BlockModel } from './BlockModel';

export interface BlockchainModel<T> {
  chain: Array<BlockModel<T>>;

  addBlock(data: T): BlockModel<T>;
  getGenesisBlock(): BlockModel<T>;
  getLastBlock(): BlockModel<T>;
  isValidChain(chain: Array<BlockModel<T>>): boolean;
  replaceChain(chain: Array<BlockModel<T>>): void;
}

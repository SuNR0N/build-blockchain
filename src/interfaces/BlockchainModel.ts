import { Block } from '../models/Block';

export interface BlockchainModel<T> {
  chain: Array<Block<T>>;

  addBlock(data: T): Block<T>;
  getGenesisBlock(): Block<T>;
  getLastBlock(): Block<T>;
  isValidChain(chain: Array<Block<T>>): boolean;
  replaceChain(chain: Array<Block<T>>): void;
}

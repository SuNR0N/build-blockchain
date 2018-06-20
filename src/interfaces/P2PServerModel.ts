import { Blockchain } from '../models/BlockChain';

export interface P2PServerModel {
  blockchain: Blockchain<string>;

  listen(): void;
  synchronizeChains(): void;
}

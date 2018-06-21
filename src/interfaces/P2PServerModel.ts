import { Blockchain } from '../models/Blockchain';

export interface P2PServerModel {
  blockchain: Blockchain<string>;

  listen(): void;
  synchronizeChains(): void;
}

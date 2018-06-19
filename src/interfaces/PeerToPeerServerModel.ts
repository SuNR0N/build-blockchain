import { Blockchain } from '../models/BlockChain';

export interface PeerToPeerServerModel {
  blockchain: Blockchain<string>;

  listen(): void;
  connectSocket(socket: any): void;
}

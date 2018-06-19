import { Server } from 'ws';

import { PeerToPeerServerModel } from '../interfaces';
import { Blockchain } from './BlockChain';

const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

export class PeerToPeerServer implements PeerToPeerServerModel {
  private sockets: string[];

  constructor(
    public blockchain: Blockchain<string>,
  ) {
    this.sockets = [];
  }

  public listen(): void {
    const server = new Server({ port: WS_PORT });
    server.on('connection', (socket) => {
      this.connectSocket(socket);
    });
  }

  public connectSocket(socket: any): void {
    this.sockets.push(socket);
    // tslint:disable-next-line:no-console
    console.log('Socket connected');
  }
}

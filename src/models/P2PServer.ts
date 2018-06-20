import WebSocket from 'ws';

import { P2PServerModel } from '../interfaces';
import { Blockchain } from './BlockChain';

const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

export class P2PServer implements P2PServerModel {
  private sockets: WebSocket[];

  constructor(
    public blockchain: Blockchain<string>,
  ) {
    this.sockets = [];
  }

  public listen(): void {
    const server = new WebSocket.Server({ port: WS_PORT });
    server.on('connection', (socket: WebSocket) => {
      this.connectSocket(socket);
    });

    this.connectToPeers();

    // tslint:disable-next-line:no-console
    console.log(`Listening for peer-to-peer connections on: ${WS_PORT}`);
  }

  public synchronizeChains(): void {
    this.sockets.forEach((socket) => this.sendChain(socket));
  }

  private sendChain(socket: WebSocket): void {
    socket.send(JSON.stringify(this.blockchain.chain));
  }

  private messageHandler(socket: WebSocket): void {
    socket.on('message', (message: string) => {
      const data = JSON.parse(message);

      this.blockchain.replaceChain(data);
    });
  }

  private connectToPeers(): void {
    peers.forEach((peer) => {
      const socket = new WebSocket(peer);

      socket.on('open', () => this.connectSocket(socket));
    });
  }

  private connectSocket(socket: WebSocket): void {
    this.sockets.push(socket);
    // tslint:disable-next-line:no-console
    console.log('Socket connected');

    this.messageHandler(socket);

    this.sendChain(socket);
  }
}

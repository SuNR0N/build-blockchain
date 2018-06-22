import WebSocket from 'ws';

import {
  CHAIN,
  Message,
  P2PServerModel,
  TRANSACTION,
  TransactionModel,
} from '../interfaces';
import {
  Blockchain,
  TransactionPool,
} from './';

const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

export class P2PServer implements P2PServerModel {
  private sockets: WebSocket[];

  constructor(
    private blockchain: Blockchain<string>,
    private transactionPool: TransactionPool,
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

  public broadcastTransaction(transaction: TransactionModel): void {
    this.sockets.forEach((socket) => this.sendTransaction(socket, transaction));
  }

  public synchronizeChains(): void {
    this.sockets.forEach((socket) => this.sendChain(socket));
  }

  private sendChain(socket: WebSocket): void {
    const message: Message = {
      data: this.blockchain.chain,
      type: CHAIN,
    };
    socket.send(JSON.stringify(message));
  }

  private sendTransaction(socket: WebSocket, transaction: TransactionModel): void {
    const message: Message = {
      data: transaction,
      type: TRANSACTION,
    };
    socket.send(JSON.stringify(message));
  }

  private messageHandler(socket: WebSocket): void {
    socket.on('message', (message: string) => {
      const msg: Message = JSON.parse(message);

      switch (msg.type) {
        case CHAIN:
          this.blockchain.replaceChain(msg.data);
          break;
        case TRANSACTION:
          this.transactionPool.updateOrAddTransaction(msg.data);
          break;
        default:
          // tslint:disable-next-line:no-console
          console.log(`Unknown message type: ${(msg as any).type}`);
          break;
      }
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

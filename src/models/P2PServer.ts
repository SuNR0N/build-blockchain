import WebSocket from 'ws';

import {
  CHAIN,
  CLEAR_TRANSACTIONS,
  IBlockchain,
  IP2PServer,
  ITransaction,
  ITransactionPool,
  Message,
  TRANSACTION,
} from '../interfaces';
import { logger } from '../utils/Logger';

const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

export class P2PServer implements IP2PServer {
  private sockets: WebSocket[];

  constructor(
    private blockchain: IBlockchain<ITransaction[]>,
    private transactionPool: ITransactionPool,
  ) {
    this.sockets = [];
  }

  public broadcastClearTransactions(): void {
    this.sockets.forEach((socket) => this.sendClearTransactions(socket));
  }

  public broadcastTransaction(transaction: ITransaction): void {
    this.sockets.forEach((socket) => this.sendTransaction(socket, transaction));
  }

  public listen(): void {
    const server = new WebSocket.Server({ port: WS_PORT });
    server.on('connection', (socket: WebSocket) => {
      this.connectSocket(socket);
    });
    this.connectToPeers();

    logger.info(`Listening for peer-to-peer connections on: ${WS_PORT}`);
  }

  public synchronizeChains(): void {
    this.sockets.forEach((socket) => this.sendChain(socket));
  }

  private connectSocket(socket: WebSocket): void {
    this.sockets.push(socket);
    logger.info('Socket connected');

    this.messageHandler(socket);

    this.sendChain(socket);
  }

  private connectToPeers(): void {
    peers.forEach((peer) => {
      const socket = new WebSocket(peer);

      socket.on('open', () => this.connectSocket(socket));
    });
  }

  private messageHandler(socket: WebSocket): void {
    socket.on('message', (message: string) => {
      const msg: Message = JSON.parse(message);

      switch (msg.type) {
        case CHAIN:
          this.blockchain.replaceChain(msg.data);
          break;
        case CLEAR_TRANSACTIONS:
          this.transactionPool.clear();
          break;
        case TRANSACTION:
          this.transactionPool.updateOrAddTransaction(msg.data);
          break;
        default:
          logger.error(`Unknown message type: ${(msg as any).type}`);
          break;
      }
    });
  }

  private sendChain(socket: WebSocket): void {
    const message: Message = {
      data: this.blockchain.chain,
      type: CHAIN,
    };
    socket.send(JSON.stringify(message));
  }

  private sendClearTransactions(socket: WebSocket): void {
    const message: Message = {
      type: CLEAR_TRANSACTIONS,
    };
    socket.send(JSON.stringify(message));
  }

  private sendTransaction(socket: WebSocket, transaction: ITransaction): void {
    const message: Message = {
      data: transaction,
      type: TRANSACTION,
    };
    socket.send(JSON.stringify(message));
  }
}

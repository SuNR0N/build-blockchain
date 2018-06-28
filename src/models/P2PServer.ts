import WebSocket from 'ws';

import { EventEmitter } from 'events';
import {
  ADDRESS,
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

export const CONNECTED_EVENT = 'connected';

export class P2PServer extends EventEmitter implements IP2PServer {
  private sockets: Map<WebSocket, string | null>;

  constructor(
    private blockchain: IBlockchain<ITransaction[]>,
    private transactionPool: ITransactionPool,
  ) {
    super();
    this.sockets = new Map();
  }

  public get addresses(): string[] {
    return Array.from(this.sockets.values())
      .filter((address): address is string => typeof address === 'string');
  }

  public broadcastAddress(address: string): void {
    this.sockets.forEach((adr, socket) => this.sendAddress(socket, address));
  }

  public broadcastClearTransactions(): void {
    this.sockets.forEach((adr, socket) => this.sendClearTransactions(socket));
  }

  public broadcastTransaction(transaction: ITransaction): void {
    this.sockets.forEach((adr, socket) => this.sendTransaction(socket, transaction));
  }

  public listen(port: number, peers: string[]): void {
    const server = new WebSocket.Server({ port });
    server.on('connection', (socket: WebSocket) => {
      this.connectSocket(socket);
    });
    this.connectToPeers(peers);

    logger.info(`Listening for peer-to-peer connections on: ${port}`);
  }

  public synchronizeChains(): void {
    this.sockets.forEach((adr, socket) => this.sendChain(socket));
  }

  private closeHandler(socket: WebSocket): void {
    socket.on('close', () => {
      this.sockets.delete(socket);
    });
  }

  private connectSocket(socket: WebSocket): void {
    this.sockets.set(socket, null);
    logger.info('Socket connected');

    this.messageHandler(socket);
    this.closeHandler(socket);
    this.emit(CONNECTED_EVENT);

    this.sendChain(socket);
  }

  private connectToPeers(peers: string[]): void {
    peers.forEach((peer) => {
      const socket = new WebSocket(peer);

      socket.on('open', () => this.connectSocket(socket));
    });
  }

  private messageHandler(socket: WebSocket): void {
    socket.on('message', (message: string) => {
      const msg: Message = JSON.parse(message);

      switch (msg.type) {
        case ADDRESS:
          this.sockets.set(socket, msg.data);
          break;
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

  private sendAddress(socket: WebSocket, address: string): void {
    const message: Message = {
      data: address,
      type: ADDRESS,
    };
    socket.send(JSON.stringify(message));
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

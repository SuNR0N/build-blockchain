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

export const SYNC_ADDRESS_EVENT = 'syncaddress';
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT, 10) : 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

export class P2PServer extends EventEmitter implements IP2PServer {
  // tslint:disable-next-line:variable-name
  private _addresses: Set<string>;
  private sockets: WebSocket[];

  constructor(
    private blockchain: IBlockchain<ITransaction[]>,
    private transactionPool: ITransactionPool,
  ) {
    super();
    this._addresses = new Set();
    this.sockets = [];
  }

  public get addresses(): Set<string> {
    return this._addresses;
  }

  public broadcastAddress(address: string): void {
    this.sockets.forEach((socket) => this.sendAddress(socket, address));
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

  private closeHandler(socket: WebSocket): void {
    socket.on('close', () => {
      const indexToRemove = this.sockets.indexOf(socket);
      this.sockets.splice(indexToRemove, 1);
      this._addresses.clear();
      this.emit(SYNC_ADDRESS_EVENT);
    });
  }

  private connectSocket(socket: WebSocket): void {
    this.sockets.push(socket);
    logger.info('Socket connected');

    this.messageHandler(socket);
    this.closeHandler(socket);
    this.emit(SYNC_ADDRESS_EVENT);

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
        case ADDRESS:
          this._addresses.add(msg.data);
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

import WebSocket from 'ws';

import {
  ADDRESS,
  CHAIN,
  CLEAR_TRANSACTIONS,
  IBlock,
  ITransaction,
  Message,
  TRANSACTION,
} from '../interfaces';
import { logger } from '../utils/Logger';
import {
  Blockchain,
  CONNECTED_EVENT,
  P2PServer,
  Transaction,
  TransactionPool,
} from './';

describe('P2PServer', () => {
  const mockSocket1 = {
    on: jest.fn(),
    send: jest.fn(),
  } as any as WebSocket;
  const mockSocket2 = {
    on: jest.fn(),
    send: jest.fn(),
  } as any as WebSocket;
  let blockchain: Blockchain;
  let transactionPool: TransactionPool;

  beforeEach(() => {
    blockchain = new Blockchain();
    transactionPool = new TransactionPool();
  });

  describe('constructor', () => {
    it('should initialise the map of sockets', () => {
      const p2pServer: any = new P2PServer(blockchain, transactionPool);

      expect(p2pServer.sockets).toBeInstanceOf(Map);
    });
  });

  describe('addresses', () => {
    it('should return not null addresses only', () => {
      const p2pServer: any = new P2PServer(blockchain, transactionPool);
      p2pServer.sockets = new Map<WebSocket, string | null>([
        [mockSocket1, null],
        [mockSocket2, 'foobar'],
      ]);

      expect(p2pServer.addresses).toEqual(['foobar']);
    });
  });

  describe('broadcastAddress', () => {
    it('should call the sendAddress function with the provided address for each connected socket', () => {
      const p2pServer = new P2PServer(blockchain, transactionPool);
      const sendAddressSpy = jest.spyOn(p2pServer as any, 'sendAddress');
      (p2pServer as any).sockets = new Map<WebSocket, string | null>([
        [mockSocket1, 'foo'],
        [mockSocket2, 'bar'],
      ]);
      p2pServer.broadcastAddress('foobar');

      expect(sendAddressSpy).toHaveBeenCalledTimes(2);
      expect(sendAddressSpy).toHaveBeenNthCalledWith(1, mockSocket1, 'foobar');
      expect(sendAddressSpy).toHaveBeenNthCalledWith(2, mockSocket2, 'foobar');
    });
  });

  describe('broadcastClearTransactions', () => {
    it('should call the sendClearTransactions function for each connected socket', () => {
      const p2pServer = new P2PServer(blockchain, transactionPool);
      const sendClearTransactionsSpy = jest.spyOn(p2pServer as any, 'sendClearTransactions');
      (p2pServer as any).sockets = new Map<WebSocket, string | null>([
        [mockSocket1, 'foo'],
        [mockSocket2, 'bar'],
      ]);
      p2pServer.broadcastClearTransactions();

      expect(sendClearTransactionsSpy).toHaveBeenCalledTimes(2);
      expect(sendClearTransactionsSpy).toHaveBeenNthCalledWith(1, mockSocket1);
      expect(sendClearTransactionsSpy).toHaveBeenNthCalledWith(2, mockSocket2);
    });
  });

  describe('broadcastTransaction', () => {
    it('should call the sendTransaction function with the provided transaction for each connected socket', () => {
      const p2pServer = new P2PServer(blockchain, transactionPool);
      const sendTransactionSpy = jest.spyOn(p2pServer as any, 'sendTransaction');
      (p2pServer as any).sockets = new Map<WebSocket, string | null>([
        [mockSocket1, 'foo'],
        [mockSocket2, 'bar'],
      ]);
      const transaction = {} as Transaction;
      p2pServer.broadcastTransaction(transaction);

      expect(sendTransactionSpy).toHaveBeenCalledTimes(2);
      expect(sendTransactionSpy).toHaveBeenNthCalledWith(1, mockSocket1, transaction);
      expect(sendTransactionSpy).toHaveBeenNthCalledWith(2, mockSocket2, transaction);
    });
  });

  describe('listen', () => {
    describe('given the WS_PORT environment variable exists', () => {
      const originalVariables = process.env;
      let infoSpy: jest.Mock;
      let serverSpy: jest.Mock;

      beforeEach(async () => {
        jest.resetModules();
        process.env = { ...originalVariables };
        process.env.WS_PORT = '1337';
        serverSpy = jest.fn(() => ({ on: jest.fn() }));
        jest.doMock('ws', () => {
          const ws = jest.fn(() => ({ on: jest.fn() }));
          (ws as any).Server = serverSpy;
          return ws;
        });
        infoSpy = jest.fn();
        jest.doMock('../utils/Logger', () => ({ logger: { info: infoSpy } }));
        const { P2PServer: P2PServerWithPort } = await import('./P2PServer');
        const p2pServer = new P2PServerWithPort(blockchain, transactionPool);
        p2pServer.listen();
      });

      afterEach(() => {
        process.env = originalVariables;
      });

      it('should create a WebSocket server with a custom port', async () => {
        expect(serverSpy).toHaveBeenCalledWith({ port: 1337 });
      });

      it('should log a message on the port of the WebSocket server', () => {
        expect(infoSpy).toHaveBeenCalledWith('Listening for peer-to-peer connections on: 1337');
      });
    });

    describe('given the WS_PORT environment variable does not exist', () => {
      const originalVariables = process.env;
      let p2pServer: P2PServer;

      beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalVariables };
        delete process.env.WS_PORT;
        p2pServer = new P2PServer(blockchain, transactionPool);
      });

      afterEach(() => {
        process.env = originalVariables;
        jest.clearAllMocks();
      });

      it('should create a WebSocket server with the default port', () => {
        const serverSpy = jest.spyOn(WebSocket, 'Server')
          .mockImplementation(() => ({ on: jest.fn() }));
        p2pServer.listen();

        expect(serverSpy).toHaveBeenCalledWith({ port: 5001 });
      });

      it('should log a message on the port of the WebSocket server', () => {
        const infoSpy = jest.spyOn(logger, 'info');
        p2pServer.listen();

        expect(infoSpy).toHaveBeenCalledWith('Listening for peer-to-peer connections on: 5001');
      });
    });

    it('should add an event listener for the connection event', () => {
      const p2pServer = new P2PServer(blockchain, transactionPool);
      const onSpy = jest.fn();
      jest.spyOn(WebSocket, 'Server')
        .mockImplementation(() => ({ on: onSpy }));
      const connectSocketSpy = jest.spyOn(p2pServer as any, 'connectSocket');
      p2pServer.listen();

      const [event, handler] = onSpy.mock.calls[0];
      handler(mockSocket1);

      expect(event).toBe('connection');
      expect(connectSocketSpy).toHaveBeenCalledWith(mockSocket1);
    });

    it('should call the connectToPeers function', () => {
      const p2pServer = new P2PServer(blockchain, transactionPool);
      const connectToPeersSpy = jest.spyOn(p2pServer as any, 'connectToPeers');
      p2pServer.listen();

      expect(connectToPeersSpy).toHaveBeenCalled();
    });
  });

  describe('synchronizeChains', () => {
    it('should call the sendChain function for each connected socket', () => {
      const p2pServer = new P2PServer(blockchain, transactionPool);
      const sendChainSpy = jest.spyOn(p2pServer as any, 'sendChain');
      (p2pServer as any).sockets = new Map<WebSocket, string | null>([
        [mockSocket1, 'foo'],
        [mockSocket2, 'bar'],
      ]);

      p2pServer.synchronizeChains();

      expect(sendChainSpy).toHaveBeenCalledTimes(2);
      expect(sendChainSpy).toHaveBeenNthCalledWith(1, mockSocket1);
      expect(sendChainSpy).toHaveBeenNthCalledWith(2, mockSocket2);
    });
  });

  describe('closeHandler', () => {
    it('should add an event listener for the close event of the socket', () => {
      const p2pServer: any = new P2PServer(blockchain, transactionPool);
      const onSpy = jest.fn();
      const socket = {
        on: onSpy,
      } as any as WebSocket;
      p2pServer.closeHandler(socket);

      const [event, handler] = onSpy.mock.calls[0];
      const deleteSpy = jest.spyOn(p2pServer.sockets, 'delete');
      handler();

      expect(event).toBe('close');
      expect(deleteSpy).toHaveBeenCalledWith(socket);
    });
  });

  describe('connectSocket', () => {
    let closeHandlerSpy: jest.SpyInstance;
    let emitSpy: jest.SpyInstance;
    let infoSpy: jest.SpyInstance;
    let messageHandlerSpy: jest.SpyInstance;
    let p2pServer: any;
    let sendChainSpy: jest.SpyInstance;

    beforeEach(() => {
      p2pServer = new P2PServer(blockchain, transactionPool);
      closeHandlerSpy = jest.spyOn(p2pServer, 'closeHandler');
      emitSpy = jest.spyOn(p2pServer, 'emit');
      infoSpy = jest.spyOn(logger, 'info');
      messageHandlerSpy = jest.spyOn(p2pServer, 'messageHandler');
      sendChainSpy = jest.spyOn(p2pServer, 'sendChain');
      p2pServer.connectSocket(mockSocket1);
    });

    it('should initialise the address of the socket to null', () => {
      const socketAddress = p2pServer.sockets.get(mockSocket1);

      expect(socketAddress).toBeNull();
    });

    it('should log a message on the established connection', () => {
      expect(infoSpy).toHaveBeenCalledWith('Socket connected');
    });

    it('should call the messageHandler function with the socket', () => {
      expect(messageHandlerSpy).toHaveBeenCalledWith(mockSocket1);
    });

    it('should call the closeHandler function with the socket', () => {
      expect(closeHandlerSpy).toHaveBeenCalledWith(mockSocket1);
    });

    it('should emit a connected event', () => {
      expect(emitSpy).toHaveBeenCalledWith(CONNECTED_EVENT);
    });

    it('should call the sendChain function with the socket', () => {
      expect(sendChainSpy).toHaveBeenCalledWith(mockSocket1);
    });
  });

  describe('connectToPeers', () => {
    const originalVariables = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalVariables };
      jest.clearAllMocks();
    });

    afterEach(() => {
      process.env = originalVariables;
    });

    it('should not have any peers if the PEERS environment variable is not defined', async () => {
      delete process.env.PEERS;
      const WebSocketSpy = jest.fn(() => ({ on: jest.fn() }));
      jest.doMock('ws', () => WebSocketSpy);
      const p2pServer: any = new P2PServer(blockchain, transactionPool);

      p2pServer.connectToPeers();

      expect(WebSocketSpy).not.toHaveBeenCalled();
    });

    it('should have a single peer if the PEERS environment variable contains an address', async () => {
      process.env.PEERS = 'ws://localhost:5001';
      const WebSocketSpy = jest.fn(() => ({ on: jest.fn() }));
      jest.doMock('ws', () => WebSocketSpy);
      const { P2PServer: P2PServerWithPeer } = await import('./P2PServer');
      const p2pServer: any = new P2PServerWithPeer(blockchain, transactionPool);

      p2pServer.connectToPeers();

      expect(WebSocketSpy).toHaveBeenCalledTimes(1);
      expect(WebSocketSpy).toHaveBeenNthCalledWith(1, 'ws://localhost:5001');
    });

    it('should have multiple peers if the PEERS environment variable contains more addresses', async () => {
      process.env.PEERS = 'ws://localhost:5001,ws://localhost:5002';
      const WebSocketSpy = jest.fn(() => ({ on: jest.fn() }));
      jest.doMock('ws', () => WebSocketSpy);
      const { P2PServer: P2PServerWithPeers } = await import('./P2PServer');
      const p2pServer: any = new P2PServerWithPeers(blockchain, transactionPool);

      p2pServer.connectToPeers();

      expect(WebSocketSpy).toHaveBeenCalledTimes(2);
      expect(WebSocketSpy).toHaveBeenNthCalledWith(1, 'ws://localhost:5001');
      expect(WebSocketSpy).toHaveBeenNthCalledWith(2, 'ws://localhost:5002');
    });

    it('should add an event listener for the open event for each defined WebSocket peer', async () => {
      process.env.PEERS = 'ws://localhost:5001,ws://localhost:5002';
      const on1Spy = jest.fn();
      const on2Spy = jest.fn();
      const socket1 = {
        on: on1Spy,
        send: jest.fn(),
      };
      const socket2 = {
        on: on2Spy,
        send: jest.fn(),
      };
      const WebSocketSpy = jest.fn()
        .mockImplementationOnce(() => socket1)
        .mockImplementationOnce(() => socket2);
      jest.doMock('ws', () => WebSocketSpy);
      const { P2PServer: P2PServerWithPeers } = await import('./P2PServer');
      const p2pServer: any = new P2PServerWithPeers(blockchain, transactionPool);
      const connectSocketSpy = jest.spyOn(p2pServer, 'connectSocket');

      p2pServer.connectToPeers();

      const [event1, handler1] = on1Spy.mock.calls[0];
      const [event2, handler2] = on2Spy.mock.calls[0];
      handler1();
      handler2();

      expect(event1).toBe('open');
      expect(event2).toBe('open');
      expect(connectSocketSpy).toHaveBeenNthCalledWith(1, socket1);
      expect(connectSocketSpy).toHaveBeenNthCalledWith(2, socket2);
    });
  });

  describe('messageHandler', () => {
    let event: string;
    let handler: (msg: string) => void;
    let mockSocket: WebSocket;
    let onSpy: jest.Mock;
    let p2pServer: any;

    beforeEach(() => {
      p2pServer = new P2PServer(blockchain, transactionPool);
      onSpy = jest.fn();
      mockSocket = {
        on: onSpy,
      } as any as WebSocket;
      p2pServer.messageHandler(mockSocket);
      event = onSpy.mock.calls[0][0];
      handler = onSpy.mock.calls[0][1];
    });

    it('should add an event listener for the message event on the socket', () => {
      expect(event).toBe('message');
    });

    it('should set the address of the socket based on the provided data if the message type is ADDRESS', () => {
      const message: Message = {
        data: 'foo',
        type: ADDRESS,
      };
      handler(JSON.stringify(message));

      expect(p2pServer.sockets.get(mockSocket)).toBe('foo');
    });

    it('should replace the blockchain with the provided data if the address type is CHAIN', () => {
      const replaceChainSpy = jest.spyOn(blockchain, 'replaceChain');
      const chain: Array<IBlock<ITransaction[]>> = [
        {
          data: [],
          difficulty: 1,
          hash: 'foo',
          lastHash: 'bar',
          nonce: 1,
          timestamp: 123,
        },
      ];
      const message: Message = {
        data: chain,
        type: CHAIN,
      };
      handler(JSON.stringify(message));

      expect(replaceChainSpy).toHaveBeenCalledWith(chain);
    });

    it('should clear the transaction pool if the message type is CLEAR_TRANSACTIONS', () => {
      const clearSpy = jest.spyOn(transactionPool, 'clear');
      const message: Message = {
        type: CLEAR_TRANSACTIONS,
      };
      handler(JSON.stringify(message));

      expect(clearSpy).toHaveBeenCalled();
    });

    it('should update the transaction pool with the provided data if the message type is TRANSACTION', () => {
      const updateOrAddTransactionSpy = jest.spyOn(transactionPool, 'updateOrAddTransaction');
      const transaction = {
        id: 'foo',
        input: null,
        outputs: [],
      } as any as ITransaction;
      const message: Message = {
        data: transaction,
        type: TRANSACTION,
      };
      handler(JSON.stringify(message));

      expect(updateOrAddTransactionSpy).toHaveBeenCalledWith(transaction);
    });

    it('should log an error on unknown message type', () => {
      const errorSpy = jest.spyOn(logger, 'error');
      const message = {
        type: 'foo',
      };
      handler(JSON.stringify(message));

      expect(errorSpy).toHaveBeenCalledWith('Unknown message type: foo');
    });
  });

  describe('sendAddress', () => {
    const address = 'foo';
    let message: any;

    beforeEach(() => {
      const p2pServer: any = new P2PServer(blockchain, transactionPool);
      const sendSpy = jest.fn();
      const mockSocket = {
        send: sendSpy,
      };
      p2pServer.sendAddress(mockSocket, address);
      message = JSON.parse(sendSpy.mock.calls[0][0]);
    });

    it('should send a message with type ADDRESS on the provided socket', () => {
      expect(message.type).toBe('ADDRESS');
    });

    it('should send a message with the provided address as its data on the provided socket', () => {
      expect(message.data).toBe('foo');
    });
  });

  describe('sendChain', () => {
    let message: any;

    beforeEach(() => {
      const p2pServer: any = new P2PServer(blockchain, transactionPool);
      const sendSpy = jest.fn();
      const mockSocket = {
        send: sendSpy,
      };
      p2pServer.sendChain(mockSocket);
      message = JSON.parse(sendSpy.mock.calls[0][0]);
    });

    it('should send a message with type CHAIN on the provided socket', () => {
      expect(message.type).toBe('CHAIN');
    });

    it('should send a message with the chain of the blockchain as its data on the provided socket', () => {
      expect(message.data).toEqual(blockchain.chain);
    });
  });

  describe('sendClearTransactions', () => {
    let message: any;

    beforeEach(() => {
      const p2pServer: any = new P2PServer(blockchain, transactionPool);
      const sendSpy = jest.fn();
      const mockSocket = {
        send: sendSpy,
      };
      p2pServer.sendClearTransactions(mockSocket);
      message = JSON.parse(sendSpy.mock.calls[0][0]);
    });

    it('should send a message with type CLEAR_TRANSACTIONS on the provided socket', () => {
      expect(message.type).toBe('CLEAR_TRANSACTIONS');
    });
  });

  describe('sendTransaction', () => {
    const transaction = {
      id: 'foo',
      input: null,
      outputs: [],
    } as any as ITransaction;
    let message: any;

    beforeEach(() => {
      const p2pServer: any = new P2PServer(blockchain, transactionPool);
      const sendSpy = jest.fn();
      const mockSocket = {
        send: sendSpy,
      };
      p2pServer.sendTransaction(mockSocket, transaction);
      message = JSON.parse(sendSpy.mock.calls[0][0]);
    });

    it('should send a message with type TRANSACTION on the provided socket', () => {
      expect(message.type).toBe('TRANSACTION');
    });

    it('should send a message with the provided transaction as its data on the provided socket', () => {
      expect(message.data).toEqual(transaction);
    });
  });
});

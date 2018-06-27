import { MINING_REWARD } from '../config';
import {
  IBlock,
  ITransaction,
} from '../interfaces';
import {
  Blockchain,
  CONNECTED_EVENT,
  Miner,
  P2PServer,
  TransactionPool,
  Wallet,
} from './';

describe('Miner', () => {
  describe('constructor', () => {
    let miner: any;
    let onSpy: jest.SpyInstance;

    beforeEach(() => {
      const blockchain = new Blockchain();
      const transactionPool = new TransactionPool();
      const wallet = new Wallet();
      const p2pServer = new P2PServer(blockchain, transactionPool);
      onSpy = jest.spyOn(p2pServer, 'on');
      miner = new Miner(blockchain, transactionPool, wallet, p2pServer);
    });

    it('should add an event listener for the connected event', () => {
      const [event, handler] = onSpy.mock.calls[0];

      expect(event).toBe(CONNECTED_EVENT);
      expect(handler()).toBe(miner.connectedHandler());
    });
  });

  describe('mine', () => {
    let blockchain: Blockchain;
    let transactionPool: TransactionPool;
    let miner: Miner;
    let p2pServer: P2PServer;
    let wallet: Wallet;

    let broadcastClearTransactionsSpy: jest.SpyInstance;
    let clearSpy: jest.SpyInstance;
    let synchronizeChainsSpy: jest.SpyInstance;
    let block: IBlock<ITransaction[]>;

    beforeEach(() => {
      blockchain = new Blockchain();
      transactionPool = new TransactionPool();
      wallet = new Wallet();
      p2pServer = new P2PServer(blockchain, transactionPool);
      miner = new Miner(blockchain, transactionPool, wallet, p2pServer);

      broadcastClearTransactionsSpy = jest.spyOn(p2pServer, 'broadcastClearTransactions');
      clearSpy = jest.spyOn(transactionPool, 'clear');
      synchronizeChainsSpy = jest.spyOn(p2pServer, 'synchronizeChains');

      block = miner.mine();
    });

    it('should add the reward to transactions of the mined block', () => {
      expect(block.data).toContainEqual(expect.objectContaining({
        input: expect.objectContaining({
          address: 'blockchain-wallet',
        }),
        outputs: expect.arrayContaining([
          {
            address: wallet.publicKey,
            amount: MINING_REWARD,
          },
        ]),
      }));
    });

    it('should synchronize the blockchains', () => {
      expect(synchronizeChainsSpy).toHaveBeenCalled();
    });

    it('should clear the transaction pool', () => {
      expect(clearSpy).toHaveBeenCalled();
    });

    it('should broadcast a message to clear the transactions', () => {
      expect(broadcastClearTransactionsSpy).toHaveBeenCalled();
    });
  });

  describe('connectedHandler', () => {
    let broadcastAddressSpy: jest.SpyInstance;
    let miner: any;
    let wallet: Wallet;

    beforeEach(() => {
      const blockchain = new Blockchain();
      const transactionPool = new TransactionPool();
      wallet = new Wallet();
      const p2pServer = new P2PServer(blockchain, transactionPool);
      miner = new Miner(blockchain, transactionPool, wallet, p2pServer);

      broadcastAddressSpy = jest.spyOn(p2pServer, 'broadcastAddress');
    });

    it('should call the broadcastAddress function with the publicKey of the wallet', () => {
      miner.connectedHandler();

      expect(broadcastAddressSpy).toHaveBeenCalledWith(wallet.publicKey);
    });
  });
});

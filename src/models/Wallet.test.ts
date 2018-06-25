import { INITIAL_BALANCE } from '../config';
import {
  TransactionPool,
  Wallet,
} from './';
import { Blockchain } from './Blockchain';

describe('Wallet', () => {
  describe('constructor', () => {
    let wallet: Wallet;

    beforeAll(() => {
      wallet = new Wallet();
    });

    it('should create a balance with an initial value', () => {
      expect(wallet.balance).toBe(INITIAL_BALANCE);
    });

    it('should create a new keypair', () => {
      expect(wallet.keyPair).toHaveProperty('ec');
      expect(wallet.keyPair).toHaveProperty('priv');
      expect(wallet.keyPair).toHaveProperty('pub');
    });

    it('should set the public key', () => {
      expect(wallet.publicKey).toMatch(/^[a-z0-9]{130}$/);
    });
  });

  describe('toString', () => {
    it('should print out the details of the wallet', () => {
      const wallet = new Wallet();

      expect(wallet.toString()).toEqual(`Wallet -
      Balance   : 500
      Public Key: ${wallet.publicKey}`);
    });
  });

  describe('sign', () => {
    let wallet: Wallet;

    beforeAll(() => {
      wallet = new Wallet();
    });

    it('should call the sign method on the keypair with the provided data hash', () => {
      const signSpy = jest.spyOn(wallet.keyPair, 'sign');
      wallet.sign('foo');

      expect(signSpy).toHaveBeenCalledWith('foo');
    });

    it('should return a signature', () => {
      const signature = wallet.sign('foo');

      expect(signature).toHaveProperty('r');
      expect(signature).toHaveProperty('recoveryParam');
      expect(signature).toHaveProperty('s');
    });
  });

  describe('createTransaction', () => {
    const amount = 150;
    const recipient = 'r3c1p13n7';
    let blockchain: Blockchain;
    let transactionPool: TransactionPool;
    let wallet: Wallet;

    beforeEach(() => {
      blockchain = new Blockchain();
      transactionPool = new TransactionPool();
      wallet = new Wallet();
    });

    it('should log a message if the provided amount exceeds the current balance', () => {
      const logSpy = jest.spyOn(console, 'log');

      wallet.createTransaction(recipient, 1000, blockchain, transactionPool);

      expect(logSpy).toHaveBeenCalledWith('Transferable amount (1000) exceeds current balance (500).');
    });

    it('should add a new transaction to the pool if it does not exist', () => {
      wallet.createTransaction(recipient, amount, blockchain, transactionPool);
      const existingTransaction = transactionPool.transactions[0];

      expect(transactionPool.transactions).toHaveLength(1);
      expect(existingTransaction.outputs).toEqual([
        expect.objectContaining({
          address: wallet.publicKey,
          amount: wallet.balance - amount,
        }),
        expect.objectContaining({
          address: recipient,
          amount,
        }),
      ]);
    });

    it('should update the transaction with the new details if it exists in the pool', () => {
      wallet.createTransaction(recipient, amount, blockchain, transactionPool);
      wallet.createTransaction(recipient, amount, blockchain, transactionPool);
      const existingTransaction = transactionPool.transactions[0];

      expect(transactionPool.transactions).toHaveLength(1);
      expect(existingTransaction.outputs).toEqual([
        expect.objectContaining({
          address: wallet.publicKey,
          amount: wallet.balance - 2 * amount,
        }),
        expect.objectContaining({
          address: recipient,
          amount,
        }),
        expect.objectContaining({
          address: recipient,
          amount,
        }),
      ]);
    });
  });

  describe('blockchainWallet', () => {
    it('should create a wallet with an identifiable address', () => {
      const wallet = Wallet.blockchainWallet();

      expect(wallet.publicKey).toBe('blockchain-wallet');
    });
  });
});

import { INITIAL_BALANCE } from '../config';
import {
  Blockchain,
  TransactionPool,
  Wallet,
} from './';

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

    it('should call the calculateBalance function with the blockchain', () => {
      const calculateBalanceSpy = jest.spyOn(wallet, 'calculateBalance');

      wallet.createTransaction(recipient, 1000, blockchain, transactionPool);

      expect(calculateBalanceSpy).toHaveBeenCalledWith(blockchain);
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

  describe('calculateBalance', () => {
    const amountX = 100;
    const repeat = 3;
    let blockchain: Blockchain;
    let senderWallet: Wallet;
    let recipientWallet: Wallet;
    let transactionPool: TransactionPool;

    beforeEach(() => {
      transactionPool = new TransactionPool();
      blockchain = new Blockchain();
      senderWallet = new Wallet();
      recipientWallet = new Wallet();
      for (let i = 0; i < repeat; i++) {
        senderWallet.createTransaction(recipientWallet.publicKey, amountX, blockchain, transactionPool);
      }
      blockchain.addBlock(transactionPool.transactions);
    });

    it('should calculate the balance for blockchain transactions matching the recipient', () => {
      const recipientBalance = recipientWallet.calculateBalance(blockchain);

      expect(recipientBalance).toBe(INITIAL_BALANCE + repeat * amountX);
    });

    it('should calculate the balance for blockchain transactions matching the sender', () => {
      const senderBalance = senderWallet.calculateBalance(blockchain);

      expect(senderBalance).toBe(INITIAL_BALANCE - repeat * amountX);
    });

    describe('and the recipient makes a transaction', () => {
      const amountY = 75;
      let recipientBalance: number;

      beforeEach(() => {
        transactionPool.clear();
        recipientBalance = recipientWallet.calculateBalance(blockchain);
        recipientWallet.createTransaction(senderWallet.publicKey, amountY, blockchain, transactionPool);
        blockchain.addBlock(transactionPool.transactions);
      });

      describe('and the sender sends an other transaction to the recipient', () => {
        beforeEach(() => {
          transactionPool.clear();
          senderWallet.createTransaction(recipientWallet.publicKey, amountX, blockchain, transactionPool);
          blockchain.addBlock(transactionPool.transactions);
        });

        it('should calculate the recipient balance only using transactions since its most recent one', () => {
          const updatedRecipientBalance = recipientWallet.calculateBalance(blockchain);

          expect(updatedRecipientBalance).toBe(recipientBalance - amountY + amountX);
        });
      });
    });
  });
});

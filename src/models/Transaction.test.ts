import { Signature } from 'elliptic';

import { ITransactionOutput } from '../interfaces/Transaction';
import { ChainUtils } from '../utils/ChainUtils';
import {
  Transaction,
  Wallet,
} from './';

describe('Transaction', () => {
  describe('newTransaction', () => {
    const recipient = 'j0hn-d03';
    let wallet: Wallet;

    beforeEach(() => {
      wallet = new Wallet();
    });

    describe('transacting with an amount that exceeds the balance', () => {
      const amount = 1000;
      let logSpy: jest.SpyInstance;
      let transaction: Transaction | undefined;

      beforeEach(() => {
        logSpy = jest.spyOn(console, 'log');
        transaction = Transaction.newTransaction(wallet, recipient, amount);
      });

      it('should return undefined for the transaction', () => {
        expect(transaction).toBeUndefined();
      });

      it('should log a message', () => {
        expect(logSpy).toHaveBeenCalledWith("Transferable amount (1000) exceeds sender's balance.");
      });
    });

    describe('transacting with an amount that does not exceed the balance', () => {
      const amount = 50;
      let transactionWithOutputsSpy: jest.SpyInstance;

      beforeEach(() => {
        transactionWithOutputsSpy = jest.spyOn(Transaction, 'transactionWithOutputs');
        Transaction.newTransaction(wallet, recipient, amount);
      });

      afterEach(() => {
        transactionWithOutputsSpy.mockClear();
      });

      it('should call the transactionWithOutputs function with the wallet as its first argument', () => {
        const senderWallet = transactionWithOutputsSpy.mock.calls[0][0];

        expect(senderWallet).toEqual(wallet);
      });

      it('should call the transactionWithOutputs function with the remaining amount as its second argument', () => {
        const remaining = transactionWithOutputsSpy.mock.calls[0][1];

        expect(remaining).toEqual({
          address: wallet.publicKey,
          amount: 450,
        });
      });

      it('should call the transactionWithOutputs function with the spent amount as its third argument', () => {
        const spent = transactionWithOutputsSpy.mock.calls[0][2];

        expect(spent).toEqual({
          address: recipient,
          amount,
        });
      });
    });
  });

  describe('rewardTransaction', () => {
    let blockchainWallet: Wallet;
    let minerWallet: Wallet;
    let transactionWithOutputsSpy: jest.SpyInstance;

    beforeEach(() => {
      blockchainWallet = Wallet.blockchainWallet();
      minerWallet = new Wallet();
      transactionWithOutputsSpy = jest.spyOn(Transaction, 'transactionWithOutputs');
      Transaction.rewardTransaction(minerWallet, blockchainWallet);
    });

    afterEach(() => {
      transactionWithOutputsSpy.mockClear();
    });

    it('should call the transactionWithOutputs function with the blockchain wallet as its first argument', () => {
      const bcWallet = transactionWithOutputsSpy.mock.calls[0][0];

      expect(bcWallet).toEqual(blockchainWallet);
    });

    it('should call the transactionWithOutputs function with the reward as its second argument', () => {
      const reward = transactionWithOutputsSpy.mock.calls[0][1];

      expect(reward).toEqual({
        address: minerWallet.publicKey,
        amount: 50,
      });
    });
  });

  describe('signTransaction', () => {
    const mockSignature = 's1gn47ur3';
    const mockTimestamp = 123456789;
    const wallet = new Wallet();
    let transaction: Transaction;

    beforeAll(() => {
      jest.spyOn(wallet, 'sign').mockReturnValue(mockSignature);
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
      transaction = Transaction.newTransaction(wallet, 'foobar', 123)!;
      Transaction.signTransaction(transaction, wallet);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should set the address field of input to the public key of the wallet', () => {
      expect(transaction.input!.address).toBe(wallet.publicKey);
    });

    it('should set the amount field of input to the balance of the wallet', () => {
      expect(transaction.input!.amount).toBe(wallet.balance);
    });

    it('should set the signature field of input to the signature of the wallet', () => {
      expect(transaction.input!.signature).toBe(mockSignature);
    });

    it('should set the timestamp field of input to the current timestamp', () => {
      expect(transaction.input!.timestamp).toBe(mockTimestamp);
    });
  });

  describe('transactionWithOutputs', () => {
    const output1: ITransactionOutput = {
      address: 'foo',
      amount: 100,
    };
    const output2: ITransactionOutput = {
      address: 'bar',
      amount: 200,
    };
    let signTransactionSpy: jest.SpyInstance;
    let transaction: Transaction;
    let wallet: Wallet;

    beforeEach(() => {
      wallet = new Wallet();
      signTransactionSpy = jest.spyOn(Transaction, 'signTransaction');
      transaction = Transaction.transactionWithOutputs(wallet, output1, output2);
    });

    it('should add the provided outputs to the new transaction', () => {
      expect(transaction.outputs).toHaveLength(2);
      expect(transaction.outputs).toContain(output1);
      expect(transaction.outputs).toContain(output2);
    });

    it('should call the signTransaction function with the transaction and the wallet of the sender', () => {
      expect(signTransactionSpy).toHaveBeenCalledWith(transaction, wallet);
    });
  });

  describe('verifyTransaction', () => {
    it('should call the verifySignature function with the provided params', () => {
      const mockedOutputsHash = 'h45h';
      const verifySignatureSpy = jest.spyOn(ChainUtils, 'verifySignature');
      const transaction = Transaction.newTransaction(new Wallet(), 'foo', 123)!;
      jest.spyOn(ChainUtils, 'hash').mockReturnValue(mockedOutputsHash);
      Transaction.verifyTransaction(transaction);

      expect(verifySignatureSpy).toHaveBeenCalledWith(
        transaction.input!.address,
        transaction.input!.signature,
        mockedOutputsHash,
      );

      jest.restoreAllMocks();
    });

    it('should validate a valid transaction', () => {
      const transaction = Transaction.newTransaction(new Wallet(), 'foo', 123)!;
      const result = Transaction.verifyTransaction(transaction);

      expect(result).toBe(true);
    });

    it('should invalidate a corrupt transaction', () => {
      const transaction = Transaction.newTransaction(new Wallet(), 'foo', 123)!;
      transaction.outputs[0].amount = 1000000;
      const result = Transaction.verifyTransaction(transaction);

      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should log a message and return undefined if the new amount exceeds the balance', () => {
      const logSpy = jest.spyOn(console, 'log');
      const wallet = new Wallet();
      let transaction = Transaction.newTransaction(wallet, 'foo', 450)!;
      transaction = transaction.update(wallet, 'bar', 100)!;

      expect(logSpy).toHaveBeenCalledWith("Transferable amount (100) exceeds sender's balance.");
      expect(transaction).toBeUndefined();
    });

    describe('when it succeeds', () => {
      const amount = 150;
      const recipient = 'j0hn-d03';
      const wallet = new Wallet();
      let signature: Signature;
      let transaction: Transaction;

      beforeAll(() => {
        transaction = Transaction.newTransaction(wallet, 'foo', 100)!;
        signature = transaction.input!.signature;
        transaction.update(wallet, recipient, amount);
      });

      it('should change the signature of the transaction', () => {
        expect(transaction.input!.signature).not.toEqual(signature);
      });

      it('should contain an output on the spent amount', () => {
        expect(transaction.outputs).toContainEqual(expect.objectContaining({
          address: recipient,
          amount,
        }));
      });

      it('should contain an output on the updated balance', () => {
        expect(transaction.outputs).toContainEqual(expect.objectContaining({
          address: wallet.publicKey,
          amount: 250,
        }));
      });
    });
  });
});

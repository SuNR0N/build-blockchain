import { ChainUtils } from '../utils/ChainUtils';
import { Transaction } from './Transaction';
import { Wallet } from './Wallet';

describe('Transaction', () => {
  describe('constructor', () => {
    let transaction: Transaction;

    beforeAll(() => {
      jest.spyOn(ChainUtils, 'id').mockReturnValue(12345);
      transaction = new Transaction();
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should assign a unique id to the transaction', () => {
      expect(transaction.id).toBe(12345);
    });

    it('should set the input to null', () => {
      expect(transaction.input).toBeNull();
    });

    it('should set the otputs to an empty array', () => {
      expect(transaction.outputs).toHaveLength(0);
    });
  });

  describe('newTransaction', () => {
    let recipient: string;
    let wallet: Wallet;

    beforeEach(() => {
      recipient = 'j0hn-d03';
      wallet = new Wallet();
    });

    describe('transacting with an amount that exceeds the balance', () => {
      let logSpy: jest.SpyInstance;
      let transaction: Transaction | undefined;

      beforeEach(() => {
        logSpy = jest.spyOn(console, 'log');
        const amount = 1000;
        transaction = Transaction.newTransaction(wallet, recipient, amount);
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('should return undefined for the transaction', () => {
        expect(transaction).toBeUndefined();
      });

      it('should log a message', () => {
        expect(logSpy).toHaveBeenCalledWith("Transferable amount (1000) exceeds sender's balance.");
      });
    });

    describe('transacting with an amount that does not exceed the balance', () => {
      let amount: number;
      let transaction: Transaction;

      beforeEach(() => {
        amount = 50;
        transaction = Transaction.newTransaction(wallet, recipient, amount)!;
      });

      it('should contain an output on the spent amount', () => {
        expect(transaction.outputs).toContainEqual(expect.objectContaining({
          address: recipient,
          amount,
        }));
      });

      it('should contain an output on the remaining amount', () => {
        expect(transaction.outputs).toContainEqual(expect.objectContaining({
          address: wallet.publicKey,
          amount: 450,
        }));
      });
    });
  });
});

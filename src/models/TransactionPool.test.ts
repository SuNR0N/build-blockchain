import {
  Transaction,
  TransactionPool,
  Wallet,
} from './';

describe('TransactionPool', () => {
  describe('constructor', () => {
    it('should be initialized with empty transactions', () => {
      const transactionPool = new TransactionPool();

      expect(transactionPool.transactions).toHaveLength(0);
    });
  });

  describe('clear', () => {
    let transactionPool: TransactionPool;

    beforeEach(() => {
      transactionPool = new TransactionPool();
      const transaction = Transaction.newTransaction(new Wallet(), 'r3c1p13n7', 123)!;
      transactionPool.updateOrAddTransaction(transaction);
    });

    it('should clear the list of transactions', () => {
      transactionPool.clear();

      expect(transactionPool.transactions).toHaveLength(0);
    });
  });

  describe('existingTransaction', () => {
    let transaction: Transaction;
    let transactionPool: TransactionPool;
    let wallet: Wallet;

    beforeEach(() => {
      transactionPool = new TransactionPool();
      wallet = new Wallet();
      transaction = Transaction.newTransaction(wallet, 'r3c1p13n7', 123)!;
      transactionPool.updateOrAddTransaction(transaction);
    });

    it('should return the transaction if one exists with the provided address', () => {
      expect(transactionPool.existingTransaction(wallet.publicKey)).toBe(transaction);
    });

    it('should return undefined if no transaction exists with the provided address', () => {
      expect(transactionPool.existingTransaction('4ddr355')).toBeUndefined();
    });
  });

  describe('updateOrAddTransaction', () => {
    let transaction: Transaction;
    let transactionPool: TransactionPool;
    let wallet: Wallet;

    beforeEach(() => {
      wallet = new Wallet();
      transactionPool = new TransactionPool();
      transaction = Transaction.newTransaction(wallet, 'foo', 123)!;
      transactionPool.updateOrAddTransaction(transaction);
    });

    it('should add a new transaction if it does not exist yet', () => {
      expect(transactionPool.transactions).toContain(transaction);
    });

    it('should replace a transaction if one already exists with the given id', () => {
      const oldTransaction = JSON.parse(JSON.stringify(transaction));
      let newTransaction = transaction.update(wallet, 'bar', 321)!;
      transactionPool.updateOrAddTransaction(newTransaction);
      newTransaction = JSON.parse(JSON.stringify(newTransaction));
      let pooledTransaction = transactionPool.transactions.find((tr) => transaction.id === tr.id);
      pooledTransaction = JSON.parse(JSON.stringify(pooledTransaction));

      expect(transactionPool.transactions).toHaveLength(1);
      expect(pooledTransaction).toEqual(newTransaction);
      expect(pooledTransaction).not.toEqual(oldTransaction);
    });
  });

  describe('validTransactions', () => {
    let transactionPool: TransactionPool;
    let transaction: Transaction;

    beforeEach(() => {
      transactionPool = new TransactionPool();
      transaction = Transaction.newTransaction(new Wallet(), 'r3c1p13n7', 123)!;
    });

    describe('given a transaction is invalid', () => {
      beforeEach(() => {
        transaction.outputs[0].amount = 999;
        transactionPool.updateOrAddTransaction(transaction);
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should log a message', () => {
        const logSpy = jest.spyOn(console, 'log');
        transactionPool.validTransactions();

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringMatching(/^Invalid transaction \([a-z0-9-]{36}\) from [a-z0-9]{130}\.$/),
        );
      });

      it('should not be included in the results', () => {
        expect(transactionPool.validTransactions()).toHaveLength(0);
      });
    });

    describe('given a signature of a transaction is invalid', () => {
      beforeEach(() => {
        const temp = transaction.outputs[0].amount;
        transaction.outputs[0].amount = transaction.outputs[1].amount;
        transaction.outputs[1].amount = temp;
        transactionPool.updateOrAddTransaction(transaction);
      });

      afterAll(() => {
        jest.resetAllMocks();
      });

      it('should log a message', () => {
        const logSpy = jest.spyOn(console, 'log');
        transactionPool.validTransactions();

        expect(logSpy).toHaveBeenCalledWith(
          expect.stringMatching(/^Invalid signature for transaction \([a-z0-9-]{36}\) from [a-z0-9]{130}\.$/),
        );
      });

      it('should not be included in the results', () => {
        expect(transactionPool.validTransactions()).toHaveLength(0);
      });
    });

    it('should return a valid transaction', () => {
      transactionPool.updateOrAddTransaction(transaction);

      expect(transactionPool.validTransactions()).toHaveLength(1);
    });
  });
});

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
});

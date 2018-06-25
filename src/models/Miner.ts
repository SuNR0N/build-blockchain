import {
  IBlock,
  IBlockchain,
  IMiner,
  IP2PServer,
  ITransaction,
  ITransactionPool,
  IWallet,
} from '../interfaces';
import {
  Transaction,
  Wallet,
} from './';

export class Miner implements IMiner {
  constructor(
    private blokckchain: IBlockchain<ITransaction[]>,
    private transactionPool: ITransactionPool,
    private wallet: IWallet,
    private p2pServer: IP2PServer,
  ) { }

  public mine(): IBlock<ITransaction[]> {
    const validTransactions = this.transactionPool.validTransactions();
    validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
    const block = this.blokckchain.addBlock(validTransactions);
    this.p2pServer.synchronizeChains();
    this.transactionPool.clear();
    this.p2pServer.broadcastClearTransactions();

    return block;
  }
}

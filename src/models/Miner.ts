import {
  IBlock,
  IBlockchain,
  IMiner,
  ITransaction,
  ITransactionPool,
  IWallet,
} from '../interfaces';
import {
  CONNECTED_EVENT,
  P2PServer,
  Transaction,
  Wallet,
} from './';

export class Miner implements IMiner {
  constructor(
    private blokckchain: IBlockchain<ITransaction[]>,
    private transactionPool: ITransactionPool,
    private wallet: IWallet,
    private p2pServer: P2PServer,
  ) {
    this.p2pServer.on(CONNECTED_EVENT, () => this.connectedHandler());
  }

  public mine(): IBlock<ITransaction[]> {
    const validTransactions = this.transactionPool.validTransactions();
    validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
    const block = this.blokckchain.addBlock(validTransactions);
    this.p2pServer.synchronizeChains();
    this.transactionPool.clear();
    this.p2pServer.broadcastClearTransactions();

    return block;
  }

  private connectedHandler(): void {
    this.p2pServer.broadcastAddress(this.wallet.publicKey);
  }
}

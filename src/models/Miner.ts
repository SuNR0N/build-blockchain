import {
  IBlockchain,
  IMiner,
  IP2PServer,
  ITransactionPool,
  IWallet,
} from '../interfaces';

export class Miner implements IMiner {
  constructor(
    private blokckchain: IBlockchain<string>,
    private transactionPool: ITransactionPool,
    private wallet: IWallet,
    private p2pServer: IP2PServer,
  ) { }

  public mine(): void {
    // get valid transactions
    // create a block consisting of the valid transactions
    // synchronize the chains in the peer-to-peer server
    // clear the transaction pool
    // broadcast to every miner to clear their transaction pools
  }
}

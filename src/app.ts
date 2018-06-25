import bodyParser from 'body-parser';
import express from 'express';

import {
  ITransaction,
  IWallet,
} from './interfaces';
import {
  Blockchain,
  Miner,
  P2PServer,
  TransactionPool,
  Wallet,
} from './models';
import { logger } from './utils/Logger';

const PORT = process.env.PORT || 3001;
const app = express();
app.use(bodyParser.json());

const blockchain = new Blockchain<ITransaction[]>();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const p2pServer = new P2PServer(blockchain, transactionPool);
const miner = new Miner(blockchain, transactionPool, wallet, p2pServer);

app.get('/addresses', (req, res) => {
  // TODO
});

app.get('/balance', (req, res) => {
  const balance: Partial<IWallet> = {
    balance: wallet.calculateBalance(blockchain),
  };
  res.json(balance);
});

app.get('/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/mine', (req, res) => {
  const block = miner.mine();
  logger.info(`New block added: ${block.toString()}`);

  res.redirect('/blocks');
});

app.get('/my-address', (req, res) => {
  const publicKey: Partial<IWallet> = {
    publicKey: wallet.publicKey,
  };
  res.json(publicKey);
});

app.get('/transactions', (req, res) => {
  res.json(transactionPool.transactions);
});

app.post('/transactions', (req, res) => {
  const {
    address,
    amount,
  } = req.body;
  const transaction = wallet.createTransaction(address, amount, blockchain, transactionPool);
  if (transaction) {
    p2pServer.broadcastTransaction(transaction);
  }

  res.redirect('/transactions');
});

app.listen(PORT, () => {
  logger.info(`Blockchain application is listening on: http://localhost:${PORT}`);
});
p2pServer.listen();

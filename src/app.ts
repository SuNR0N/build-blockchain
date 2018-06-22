import bodyParser from 'body-parser';
import express from 'express';

import { WalletModel } from './interfaces';
import {
  Blockchain,
  P2PServer,
  TransactionPool,
  Wallet,
} from './models';

const PORT = process.env.PORT || 3001;
const app = express();
app.use(bodyParser.json());

const blockchain = new Blockchain<string>();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const p2pServer = new P2PServer(blockchain, transactionPool);

app.get('/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/mine', (req, res) => {
  const newBlock = blockchain.addBlock(req.body.data);
  // tslint:disable-next-line:no-console
  console.log(`New block added: ${newBlock.toString()}`);

  p2pServer.synchronizeChains();

  res.redirect('/blocks');
});

app.get('/public-key', (req, res) => {
  const publicKey: Partial<WalletModel> = {
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
  const transaction = wallet.createTransaction(address, amount, transactionPool);
  if (transaction) {
    p2pServer.broadcastTransaction(transaction);
  }

  res.redirect('/transactions');
});

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`Blockchain application is listening on: http://localhost:${PORT}`);
});
p2pServer.listen();

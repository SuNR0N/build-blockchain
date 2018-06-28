import bodyParser from 'body-parser';
import express from 'express';

import {
  IAddress,
  IBalance,
  IError,
  ITransaction,
} from './interfaces';
import {
  Blockchain,
  InsufficientFundsError,
  Miner,
  P2PServer,
  TransactionPool,
  Wallet,
} from './models';
import { logger } from './utils/Logger';

const app = express();
app.use(bodyParser.json());

const blockchain = new Blockchain<ITransaction[]>();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const p2pServer = new P2PServer(blockchain, transactionPool);
const miner = new Miner(blockchain, transactionPool, wallet, p2pServer);

app.get('/addresses', (req, res) => {
  const addresses: IAddress[] = p2pServer.addresses
    .map((address) => ({ publicKey: address }));
  res.json(addresses);
});

app.get('/balance', (req, res) => {
  const balance: IBalance = {
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
  const publicKey: IAddress = {
    publicKey: wallet.publicKey,
  };
  res.json(publicKey);
});

app.get('/transactions', (req, res) => {
  res.json(transactionPool.transactions);
});

app.post('/transactions', (req, res) => {
  const properties = new Map<string, string>([
    ['address', 'string'],
    ['amount', 'number'],
  ]);
  const entries = Object.entries(req.body);
  const requiredProperties = Array.from(properties.keys());
  const receivedProperties = entries.map(([key]) => key);
  if (!requiredProperties.every((property) => receivedProperties.includes(property))) {
    const errorMessage: IError = {
      message: `One ore more required property (${requiredProperties.join(', ')}) is missing.`,
    };
    res
      .status(400)
      .json(errorMessage);
    return;
  }
  for (const [key, value] of entries) {
    const propertyType = properties.get(key);
    if (!propertyType) {
      const errorMessage: IError = {
        message: `Property '${key}' is invalid.`,
      };
      res
        .status(400)
        .json(errorMessage);
      return;
    } else if (typeof value !== propertyType) {
      const errorMessage: IError = {
        message: `Property '${key}' expects a ${propertyType} but got a ${typeof value}.`,
      };
      res
        .status(400)
        .json(errorMessage);
      return;
    }
  }
  const {
    address,
    amount,
  } = req.body;
  try {
    const transaction = wallet.createTransaction(address, amount, blockchain, transactionPool);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
  } catch (err) {
    if (err instanceof InsufficientFundsError) {
      const message: IError = {
        message: err.message,
      };
      res
        .status(400)
        .json(message);
    } else {
      const message: IError = {
        message: 'An unknown error occurred.',
      };
      res
        .status(500)
        .json(message);
    }
  }
});

export {
  app,
  p2pServer,
  wallet,
};

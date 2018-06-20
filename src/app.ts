import bodyParser from 'body-parser';
import express from 'express';

import {
  Blockchain,
  P2PServer,
} from './models';

const PORT = process.env.PORT || 3001;
const app = express();
app.use(bodyParser.json());

const blockchain = new Blockchain<string>();
const p2pServer = new P2PServer(blockchain);

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

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`Blockchain application is listening on: http://localhost:${PORT}`);
});
p2pServer.listen();

import bodyParser from 'body-parser';
import express from 'express';

import { Blockchain } from './models/Blockchain';

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());

const blockchain = new Blockchain<string>();

app.get('/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/mine', (req, res) => {
  const newBlock = blockchain.addBlock(req.body.data);
  // tslint:disable-next-line:no-console
  console.log(`New block added: ${newBlock.toString()}`);

  res.redirect('/blocks');
});

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`Blockchain application is listening on: http://localhost:${PORT}`);
});

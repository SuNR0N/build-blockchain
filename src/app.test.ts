import {
  agent,
  Response,
} from 'supertest';

import {
  app,
  p2pServer,
  wallet,
} from './app';
import {
  IBlock,
  ITransaction,
} from './interfaces';
import { Wallet } from './models/Wallet';
import { logger } from './utils/Logger';

describe('app', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('/addresses', () => {
    it('should return an empty list for a single node', async () => {
      const response = await agent(app).get('/addresses');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return the addresses of other nodes', async () => {
      const mockAddresses = ['foo', 'bar'];
      jest.spyOn(p2pServer, 'addresses', 'get')
        .mockReturnValue(mockAddresses);
      const response = await agent(app).get('/addresses');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(mockAddresses.length);
      mockAddresses.forEach((address) => {
        expect(response.body).toContainEqual({ publicKey: address });
      });
    });
  });

  describe('/balance', () => {
    it('should return the balance of the current user', async () => {
      const mockBalance = 250;
      jest.spyOn(Wallet.prototype, 'calculateBalance')
        .mockReturnValue(mockBalance);
      const response = await agent(app).get('/balance');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ balance: mockBalance });
    });
  });

  describe('/blocks', () => {
    it('should return the blocks of the blockchain', async () => {
      const response = await agent(app).get('/blocks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          data: null,
          difficulty: 1,
          hash: 'f1r57-h45h',
          lastHash: '0000000000',
          nonce: 0,
          timestamp: expect.any(Number),
        },
      ]);
    });
  });

  describe('/mine', () => {
    let infoSpy: jest.SpyInstance;
    let currentBlocks: IBlock[];
    let response: Response;

    beforeAll(async () => {
      infoSpy = jest.spyOn(logger, 'info');
      currentBlocks = (await agent(app)
        .get('/blocks')).body;
      response = await agent(app)
        .post('/mine')
        .redirects(0);
    });

    it('should mine a new block', async () => {
      const { body: newBlocks } = await agent(app).get('/blocks');
      expect(newBlocks).toHaveLength(currentBlocks.length + 1);
    });

    it('should log the mined block', () => {
      expect(infoSpy).toHaveBeenCalledWith(expect.stringMatching(/^New block added:/));
    });

    it('should redirect to the GET blocks endpoint', () => {
      expect(response.status).toBe(302);
      expect(response.header).toEqual(expect.objectContaining({
        location: '/blocks',
      }));
    });
  });

  describe('/my-address', () => {
    it('should return the public address of the current user', async () => {
      const response = await agent(app).get('/my-address');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ publicKey: wallet.publicKey });
    });
  });

  describe('/transactions (GET)', () => {
    it('should return an empty list if the transaction pool is empty', async () => {
      const response = await agent(app).get('/transactions');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return the transactions in the transaction pool if they exist', async () => {
      await agent(app)
        .post('/transactions')
        .send({ address: wallet.publicKey, amount: 50 });
      const response = await agent(app).get('/transactions');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body).toContainEqual(expect.objectContaining({
        input: expect.objectContaining({
          address: wallet.publicKey,
        }),
        outputs: [
          {
            address: wallet.publicKey,
            amount: expect.any(Number),
          },
          {
            address: wallet.publicKey,
            amount: 50,
          },
        ],
      }));
    });
  });

  describe('/transactions (POST)', () => {
    it('should return a 400 if the request body does not contain all mandatory properties', async () => {
      const response = await agent(app)
        .post('/transactions')
        .send({ address: wallet.publicKey });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'One ore more required property (address, amount) is missing.',
      });
    });

    it('should return a 400 if the request body contains an invalid property', async () => {
      const response = await agent(app)
        .post('/transactions')
        .send({ address: wallet.publicKey, amount: 50, foo: 'bar' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Property 'foo' is invalid.",
      });
    });

    it('should return a 400 if a required property has an invalid type', async () => {
      const response = await agent(app)
        .post('/transactions')
        .send({ address: wallet.publicKey, amount: '50' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Property 'amount' expects a number but got a string.",
      });
    });

    it('should create a transaction with the provided properties', async () => {
      const createTransactionSpy = jest.spyOn(wallet, 'createTransaction');
      await agent(app)
        .post('/transactions')
        .send({ address: wallet.publicKey, amount: 50 });

      const [address, amount] = createTransactionSpy.mock.calls[0];
      expect(address).toBe(wallet.publicKey);
      expect(amount).toBe(50);
    });

    it('should broadcast the created transaction', async () => {
      const mockTransaction = {} as ITransaction;
      jest.spyOn(wallet, 'createTransaction')
        .mockReturnValue(mockTransaction);
      const broadcastTransactionSpy = jest.spyOn(p2pServer, 'broadcastTransaction');
      await agent(app)
        .post('/transactions')
        .send({ address: wallet.publicKey, amount: 50 });

      expect(broadcastTransactionSpy).toHaveBeenCalledWith(mockTransaction);
    });

    it('should redirect to the GET transactions endpoint', async () => {
      await agent(app)
        .post('/transactions')
        .send({ address: wallet.publicKey, amount: 50 })
        .expect(302)
        .expect('Location', '/transactions');
    });

    it('should return a 400 in case of insufficient funds', async () => {
      const response = await agent(app)
        .post('/transactions')
        .send({ address: wallet.publicKey, amount: 1000000 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: expect.stringMatching(/^Transferable amount \(1000000\) exceeds current balance \(\d{1,}\).$/),
      });
    });

    it('should return a 500 in case of an unknown error', async () => {
      jest.spyOn(wallet, 'createTransaction')
        .mockImplementation(() => {
          throw new Error();
        });
      const response = await agent(app)
        .post('/transactions')
        .send({ address: wallet.publicKey, amount: 1000000 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'An unknown error occurred.',
      });
    });
  });
});

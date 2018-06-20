import { Block } from './Block';
import { Blockchain } from './Blockchain';

describe('Blockchain', () => {
  describe('constructor', () => {
    beforeAll(() => {
      jest.spyOn(Date, 'now').mockReturnValue(12345);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should create a blockchain with a single genesis block', () => {
      const blockchain = new Blockchain<string>();
      const genesisBlock = Block.genesis<string>();
      const firstBlock = blockchain.chain[0];

      expect(blockchain.chain).toHaveLength(1);
      expect(firstBlock).toEqual(genesisBlock);
    });
  });

  describe('addBlock', () => {
    it('should add a new block to the end of the blockchain', () => {
      const blockchain = new Blockchain<string>();
      blockchain.addBlock('foo');
      const lastBlock = blockchain.chain[blockchain.chain.length - 1];

      expect(lastBlock.data).toBe('foo');
    });
  });

  describe('getGenesisBlock', () => {
    beforeAll(() => {
      jest.spyOn(Date, 'now').mockReturnValue(12345);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the genesis block of the blockchain', () => {
      const blockchain = new Blockchain<string>();
      const genesisBlock = Block.genesis<string>();

      expect(blockchain.getGenesisBlock()).toEqual(genesisBlock);
    });
  });

  describe('getLastBlock', () => {
    beforeAll(() => {
      jest.spyOn(Date, 'now').mockReturnValue(12345);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return the genesis block for a new blockchain', () => {
      const blockchain = new Blockchain<string>();
      const genesisBlock = Block.genesis<string>();

      expect(blockchain.getLastBlock()).toEqual(genesisBlock);
    });

    it('should return the last block in the blockchain', () => {
      const blockchain = new Blockchain<string>();
      blockchain.addBlock('foo');
      const lastBlock = blockchain.chain[blockchain.chain.length - 1];

      expect(blockchain.getLastBlock()).toEqual(lastBlock);
    });
  });

  describe('isValidChain', () => {
    let blockchain: Blockchain<string>;

    beforeEach(() => {
      blockchain = new Blockchain<string>();
    });

    it('should return false if the genesis blocks do not match', () => {
      const genesisBlock = Block.genesis<string>();
      genesisBlock.nonce = 1;
      const chain = [genesisBlock];

      expect(blockchain.isValidChain(chain)).toBe(false);
    });

    it('should return false if the hash of a given block is tempered', () => {
      blockchain.addBlock('foo');
      blockchain.addBlock('bar');
      const chain: Array<Block<string>> = JSON.parse(JSON.stringify(blockchain.chain));
      chain[2].lastHash = 'abc123';

      expect(blockchain.isValidChain(chain)).toBe(false);
    });

    it('should return false if the data of a given block is tempered', () => {
      blockchain.addBlock('foo');
      blockchain.addBlock('bar');
      const chain: Array<Block<string>> = JSON.parse(JSON.stringify(blockchain.chain));
      chain[1].data = 'foobar';

      expect(blockchain.isValidChain(chain)).toBe(false);
    });

    it('should return true if the chain is valid', () => {
      blockchain.addBlock('foo');
      blockchain.addBlock('bar');
      const chain: Array<Block<string>> = JSON.parse(JSON.stringify(blockchain.chain));

      expect(blockchain.isValidChain(chain)).toBe(true);
    });
  });

  describe('replaceChain', () => {
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
      logSpy = jest.spyOn(console, 'log');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should not replace the blockchain if the new chain is shorter', () => {
      const blockchain = new Blockchain<string>();
      blockchain.addBlock('foo');
      const otherBlockchain = new Blockchain<string>();

      blockchain.replaceChain(otherBlockchain.chain);

      expect(logSpy).toHaveBeenCalledWith('Received chain is not longer than the current chain.');
      expect(blockchain.chain).not.toEqual(otherBlockchain.chain);
    });

    it('should not replace the blockchain if the new chain is equal in length', () => {
      const blockchain = new Blockchain<string>();
      blockchain.addBlock('foo');
      const otherBlockchain = new Blockchain<string>();
      otherBlockchain.addBlock('bar');

      blockchain.replaceChain(otherBlockchain.chain);

      expect(logSpy).toHaveBeenCalledWith('Received chain is not longer than the current chain.');
      expect(blockchain.chain).not.toEqual(otherBlockchain.chain);
    });

    it('should not replace the blockchain if the new chain is invalid', () => {
      const blockchain = new Blockchain<string>();
      blockchain.addBlock('foo');
      const otherBlockchain = new Blockchain<string>();
      otherBlockchain.chain = JSON.parse(JSON.stringify(blockchain.chain));
      otherBlockchain.chain[1].data = 'bar';
      otherBlockchain.addBlock('bar');

      blockchain.replaceChain(otherBlockchain.chain);

      expect(logSpy).toHaveBeenCalledWith('Received chain is not valid.');
      expect(blockchain.chain).not.toEqual(otherBlockchain.chain);
    });

    it('should not replace the blockchain if the new chain is longer and valid', () => {
      const blockchain = new Blockchain<string>();
      const otherBlockchain = new Blockchain<string>();
      otherBlockchain.addBlock('foo');

      blockchain.replaceChain(otherBlockchain.chain);

      expect(logSpy).toHaveBeenCalledWith('Replacing blockchain with the new chain.');
      expect(blockchain.chain).toEqual(otherBlockchain.chain);
    });
  });
});

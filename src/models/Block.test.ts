import { DIFFICULTY } from '../config';
import { ChainUtils } from '../utils/ChainUtils';
import { Block } from './Block';

describe('Block', () => {
  describe('blockHash', () => {
    it('should call the hash function with the properties of the provided block', () => {
      const hashSpy = jest.spyOn(Block, 'hash');
      const block = new Block<string>();
      const {
        data,
        difficulty,
        lastHash,
        nonce,
        timestamp,
      } = block;

      Block.blockHash(block);

      expect(hashSpy).toHaveBeenCalledWith(
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty,
      );
    });
  });

  describe('genesis', () => {
    beforeAll(() => {
      jest.spyOn(Date, 'now').mockReturnValue(12345);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should return a block with hardcoded values', () => {
      const block = Block.genesis<string>();

      expect(block.data).toBeNull();
      expect(block.hash).toBe('f1r57-h45h');
      expect(block.lastHash).toBe('0000000000');
      expect(block.timestamp).toBe(12345);
      expect(block.nonce).toBe(0);
      expect(block.difficulty).toBe(DIFFICULTY);
    });
  });

  describe('hash', () => {
    it('should call the hash function with the composite key of the block', () => {
      const hashSpy = jest.spyOn(ChainUtils, 'hash');

      Block.hash<string>(123, 'a1b', 'foo', 1, 3);

      expect(hashSpy).toHaveBeenCalledWith('123a1bfoo13');
    });
  });

  describe('mineBlock', () => {
    let genesisBlock: Block<string>;
    let newBlock: Block<string>;

    beforeAll(() => {
      jest.spyOn(Date, 'now').mockReturnValue(12345);
      genesisBlock = Block.genesis<string>();
      newBlock = Block.mineBlock<string>(genesisBlock, 'foo');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should set the timestamp based on the current time', () => {
      expect(newBlock.timestamp).toBe(12345);
    });

    it('should set the lastHash based on the hash of the last block', () => {
      expect(newBlock.lastHash).toBe(genesisBlock.hash);
    });

    it('should set the data to match the input', () => {
      expect(newBlock.data).toBe('foo');
    });

    it('should generate a hash which matches the difficulty', () => {
      const hashPrefix = '0'.repeat(newBlock.difficulty);

      expect(newBlock.hash.startsWith(hashPrefix)).toBe(true);
    });
  });

  describe('adjustDifficulty', () => {
    it('should lower the difficulty for slowly mined blocks', () => {
      const lastBlock = new Block<string>();
      const currentTimestamp = lastBlock.timestamp + 3600000;

      const difficulty = Block.adjustDifficulty<string>(lastBlock, currentTimestamp);

      expect(difficulty).toBe(lastBlock.difficulty - 1);
    });

    it('should increase the difficulty for quickly mined blocks', () => {
      const lastBlock = new Block<string>();
      const currentTimestamp = lastBlock.timestamp + 1;

      const difficulty = Block.adjustDifficulty<string>(lastBlock, currentTimestamp);

      expect(difficulty).toBe(lastBlock.difficulty + 1);
    });
  });

  describe('constructor', () => {
    beforeAll(() => {
      jest.spyOn(Date, 'now').mockReturnValue(12345);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('should create a block without any arguments', () => {
      const block = new Block();

      expect(block.data).toBeNull();
      expect(block.hash).toBe('');
      expect(block.lastHash).toBe('');
      expect(block.timestamp).toBe(12345);
      expect(block.nonce).toBe(0);
      expect(block.difficulty).toBe(DIFFICULTY);
    });

    it('should create a block with a timestamp', () => {
      const timestamp = Date.now();
      const block = new Block(timestamp);

      expect(block.data).toBeNull();
      expect(block.hash).toBe('');
      expect(block.lastHash).toBe('');
      expect(block.timestamp).toBe(timestamp);
      expect(block.nonce).toBe(0);
      expect(block.difficulty).toBe(DIFFICULTY);
    });

    it('should create a block with a timestamp and a lastHash', () => {
      const timestamp = Date.now();
      const block = new Block(timestamp, 'a1b');

      expect(block.data).toBeNull();
      expect(block.hash).toBe('');
      expect(block.lastHash).toBe('a1b');
      expect(block.timestamp).toBe(timestamp);
      expect(block.nonce).toBe(0);
      expect(block.difficulty).toBe(DIFFICULTY);
    });

    it('should create a block with a timestamp, lastHash and hash', () => {
      const timestamp = Date.now();
      const block = new Block(timestamp, 'a1b', '2c3');

      expect(block.data).toBeNull();
      expect(block.hash).toBe('2c3');
      expect(block.lastHash).toBe('a1b');
      expect(block.timestamp).toBe(timestamp);
      expect(block.nonce).toBe(0);
      expect(block.difficulty).toBe(DIFFICULTY);
    });

    it('should create a block with a timestamp, lastHash, hash and data', () => {
      const timestamp = Date.now();
      const block = new Block<string>(timestamp, 'a1b', '2c3', 'foo');

      expect(block.data).toBe('foo');
      expect(block.hash).toBe('2c3');
      expect(block.lastHash).toBe('a1b');
      expect(block.timestamp).toBe(timestamp);
      expect(block.nonce).toBe(0);
      expect(block.difficulty).toBe(DIFFICULTY);
    });

    it('should create a block with a timestamp, lastHash, hash, data and nonce', () => {
      const timestamp = Date.now();
      const block = new Block<string>(timestamp, 'a1b', '2c3', 'foo', 1);

      expect(block.data).toBe('foo');
      expect(block.hash).toBe('2c3');
      expect(block.lastHash).toBe('a1b');
      expect(block.timestamp).toBe(timestamp);
      expect(block.nonce).toBe(1);
      expect(block.difficulty).toBe(DIFFICULTY);
    });

    it('should create a block with a timestamp, lastHash, hash, data, nonce and difficulty', () => {
      const timestamp = Date.now();
      const block = new Block<string>(timestamp, 'a1b', '2c3', 'foo', 1, 3);

      expect(block.data).toBe('foo');
      expect(block.hash).toBe('2c3');
      expect(block.lastHash).toBe('a1b');
      expect(block.timestamp).toBe(timestamp);
      expect(block.nonce).toBe(1);
      expect(block.difficulty).toBe(3);
    });
  });

  describe('toString', () => {
    it('should print out the details of the block', () => {
      const timestamp = Date.now();
      const block = new Block<string>(timestamp, 'a1b', '2c3', 'foo', 0, 1);

      expect(block.toString()).toEqual(`Block -
      Difficulty: 1
      Hash      : 2c3
      Last Hash : a1b
      Nonce     : 0
      Timestamp : ${timestamp}
      Data      : foo`);
    });
  });
});

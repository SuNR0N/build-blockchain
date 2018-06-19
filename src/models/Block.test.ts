import { Block } from './Block';

describe('Block', () => {
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
    });

    it('should create a block with a timestamp', () => {
      const timestamp = Date.now();
      const block = new Block(timestamp);

      expect(block.data).toBeNull();
      expect(block.hash).toBe('');
      expect(block.lastHash).toBe('');
      expect(block.timestamp).toBe(timestamp);
    });

    it('should create a block with a timestamp and a lastHash', () => {
      const timestamp = Date.now();
      const block = new Block(timestamp, 'a1b');

      expect(block.data).toBeNull();
      expect(block.hash).toBe('');
      expect(block.lastHash).toBe('a1b');
      expect(block.timestamp).toBe(timestamp);
    });

    it('should create a block with a timestamp, lastHash and hash', () => {
      const timestamp = Date.now();
      const block = new Block(timestamp, 'a1b', '2c3');

      expect(block.data).toBeNull();
      expect(block.hash).toBe('2c3');
      expect(block.lastHash).toBe('a1b');
      expect(block.timestamp).toBe(timestamp);
    });

    it('should create a block with a timestamp, lastHash, hash and data', () => {
      const timestamp = Date.now();
      const block = new Block<string>(timestamp, 'a1b', '2c3', 'foo');

      expect(block.data).toBe('foo');
      expect(block.hash).toBe('2c3');
      expect(block.lastHash).toBe('a1b');
      expect(block.timestamp).toBe(timestamp);
    });
  });

  describe('toString', () => {
    it('should print out the details of the block', () => {
      const timestamp = Date.now();
      const block = new Block<string>(timestamp, 'a1b', '2c3', 'foo');

      expect(block.toString()).toEqual(`Block -
      Timestamp : ${timestamp}
      Last Hash : a1b
      Hash      : 2c3
      Data      : foo`);
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
  });
});

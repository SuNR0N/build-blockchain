import {
  INITIAL_BALANCE,
  MINING_REWARD,
} from './config';

describe('config', () => {
  const originalVariables = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalVariables };
  });

  afterEach(() => {
    process.env = originalVariables;
  });

  describe('DIFFICULTY', () => {
    it('should be equal to the parsed environment variable with the same name if it is defined', () => {
      process.env.DIFFICULTY = '4';
      const { DIFFICULTY } = require('./config');

      expect(DIFFICULTY).toBe(4);
    });

    it('should be set to 3 if no environment variable exists', () => {
      delete process.env.DIFFICULTY;
      const { DIFFICULTY } = require('./config');

      expect(DIFFICULTY).toBe(3);
    });
  });

  describe('INITIAL_BALANCE', () => {
    it('should be set to 500', () => {
      expect(INITIAL_BALANCE).toBe(500);
    });
  });

  describe('MINE_RATE', () => {
    it('should be equal to the parsed environment variable with the same name if it is defined', () => {
      process.env.MINE_RATE = '2500';
      const { MINE_RATE } = require('./config');

      expect(MINE_RATE).toBe(2500);
    });

    it('should be set to 3000 if no environment variable exists', () => {
      delete process.env.MINE_RATE;
      const { MINE_RATE } = require('./config');

      expect(MINE_RATE).toBe(3000);
    });
  });

  describe('MINING_REWARD', () => {
    it('should be set to 50', () => {
      expect(MINING_REWARD).toBe(50);
    });
  });

  describe('PEERS', () => {
    it('should convert a single peer address to an array with one element', () => {
      process.env.PEERS = 'ws://localhost:1337';
      const { PEERS } = require('./config');

      expect(PEERS).toEqual(['ws://localhost:1337']);
    });

    it('should convert multiple peer addresses to an array with multiple elements', () => {
      process.env.PEERS = 'ws://localhost:1234,ws://localhost:5678';
      const { PEERS } = require('./config');

      expect(PEERS).toEqual([
        'ws://localhost:1234',
        'ws://localhost:5678',
      ]);
    });

    it('should be set to an empty array if no environment variable exists', () => {
      delete process.env.PEERS;
      const { PEERS } = require('./config');

      expect(PEERS).toHaveLength(0);
    });
  });

  describe('PORT', () => {
    it('should be equal to the parsed environment variable with the same name if it is defined', () => {
      process.env.PORT = '1337';
      const { PORT } = require('./config');

      expect(PORT).toBe(1337);
    });

    it('should be set to 3001 if no environment variable exists', () => {
      delete process.env.PORT;
      const { PORT } = require('./config');

      expect(PORT).toBe(3001);
    });
  });

  describe('WS_PORT', () => {
    it('should be equal to the parsed environment variable with the same name if it is defined', () => {
      process.env.WS_PORT = '7331';
      const { WS_PORT } = require('./config');

      expect(WS_PORT).toBe(7331);
    });

    it('should be set to 5001 if no environment variable exists', () => {
      delete process.env.WS_PORT;
      const { WS_PORT } = require('./config');

      expect(WS_PORT).toBe(5001);
    });
  });
});

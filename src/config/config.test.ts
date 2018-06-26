import {
  INITIAL_BALANCE,
  MINING_REWARD,
} from './config';

describe('config', () => {
  const originalVariables = process.env;

  describe('DIFFICULTY', () => {
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalVariables };
    });

    afterEach(() => {
      process.env = originalVariables;
    });

    it('should be equal to the environment variable with the same name if it is defined', () => {
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
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalVariables };
    });

    afterEach(() => {
      process.env = originalVariables;
    });

    it('should be equal to the environment variable with the same name if it is defined', () => {
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
});

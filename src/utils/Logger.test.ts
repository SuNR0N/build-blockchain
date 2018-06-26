import {
  format,
  transports,
} from 'winston';

import { logger } from './Logger';

describe('Logger', () => {
  describe('logger', () => {
    it('should have a JSON format', () => {
      expect(logger.format).toEqual(format.json());
    });

    it('should have a level set to info', () => {
      expect(logger.level).toBe('info');
    });

    it('should have an error log', () => {
      const errorLogger = logger.transports[0];

      expect(errorLogger.level).toBe('error');
      expect(errorLogger).toEqual(expect.objectContaining({
        filename: 'error.log',
      }));
    });

    it('should have a combined log', () => {
      const combinedLogger = logger.transports[1];

      expect(combinedLogger.level).toBeUndefined();
      expect(combinedLogger).toEqual(expect.objectContaining({
        filename: 'combined.log',
      }));
    });

    it('should contain the console transport in non production', () => {
      const consoleLogger = logger.transports[2];

      expect(consoleLogger).toBeInstanceOf(transports.Console);
    });

    describe('given the NODE_ENV is set to production', () => {
      const originalVariables = process.env;

      beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalVariables };
        process.env.NODE_ENV = 'production';
      });

      afterEach(() => {
        process.env = originalVariables;
      });

      it('should not contain the console transport', () => {
        const { logger: prodLogger } = require('./Logger');
        const fileTransportPredicate = (transport: transports.Transports) => transport instanceof transports.File;

        expect(prodLogger.transports.every(fileTransportPredicate)).toBe(true);
      });
    });
  });
});

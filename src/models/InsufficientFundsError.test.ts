import { InsufficientFundsError } from './InsufficientFundsError';

describe('InsufficientFundsError', () => {
  describe('constructor', () => {
    it('should set its own prototype', () => {
      const setPrototypeOfSpy = jest.spyOn(Object, 'setPrototypeOf');
      const error = new InsufficientFundsError('foo');

      expect(setPrototypeOfSpy).toHaveBeenCalledWith(error, InsufficientFundsError.prototype);
    });
  });
});

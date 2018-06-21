import { INITIAL_BALANCE } from '../config';
import { Wallet } from './Wallet';

describe('Wallet', () => {
  describe('constructor', () => {
    let wallet: Wallet;

    beforeAll(() => {
      wallet = new Wallet();
    });

    it('should create a balance with an initial value', () => {
      expect(wallet.balance).toBe(INITIAL_BALANCE);
    });

    it('should create a new keypair', () => {
      expect(wallet.keyPair).toHaveProperty('ec');
      expect(wallet.keyPair).toHaveProperty('priv');
      expect(wallet.keyPair).toHaveProperty('pub');
    });

    it('should set the public key', () => {
      expect(wallet.publicKey).toMatch(/^[a-z0-9]{130}$/);
    });
  });

  describe('toString', () => {
    it('should print out the details of the wallet', () => {
      const wallet = new Wallet();

      expect(wallet.toString()).toEqual(`Wallet -
      Balance   : 500
      Public Key: ${wallet.publicKey}`);
    });
  });

  describe('sign', () => {
    let wallet: Wallet;

    beforeAll(() => {
      wallet = new Wallet();
    });

    it('should call the sign method on the keypair with the provided data hash', () => {
      const signSpy = jest.spyOn(wallet.keyPair, 'sign');
      wallet.sign('foo');

      expect(signSpy).toHaveBeenCalledWith('foo');
    });

    it('should return a signature', () => {
      const signature = wallet.sign('foo');

      expect(signature).toHaveProperty('r');
      expect(signature).toHaveProperty('recoveryParam');
      expect(signature).toHaveProperty('s');
    });
  });
});

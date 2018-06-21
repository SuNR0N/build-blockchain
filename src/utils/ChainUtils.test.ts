import cryptoJS from 'crypto-js';
import elliptic, { Signature } from 'elliptic';
import uuid from 'uuid';

import { ChainUtils } from './ChainUtils';

const EC = elliptic.ec;

describe('ChainUtils', () => {
  describe('generateKeyPair', () => {
    it('should return a key pair', () => {
      const keyPair = ChainUtils.generateKeyPair();

      expect(keyPair).toHaveProperty('ec');
      expect(keyPair).toHaveProperty('priv');
      expect(keyPair).toHaveProperty('pub');
    });

    it('should call the genKeyPair function', () => {
      const genKeyPairSpy = jest.spyOn(EC.prototype, 'genKeyPair');
      ChainUtils.generateKeyPair();

      expect(genKeyPairSpy).toHaveBeenCalled();
    });
  });

  describe('id', () => {
    it('should return a unique id', () => {
      const id = ChainUtils.id();

      expect(id).toMatch(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/);
    });

    it('should call the v1 function', () => {
      const v1Spy = jest.spyOn(uuid, 'v1');
      ChainUtils.id();

      expect(v1Spy).toHaveBeenCalled();
    });
  });

  describe('hash', () => {
    let SHA256Spy: jest.SpyInstance;

    beforeEach(() => {
      SHA256Spy = jest.spyOn(cryptoJS, 'SHA256');
    });

    it('should call the SHA256 function with the input if it is a string', () => {
      ChainUtils.hash('foo');

      expect(SHA256Spy).toHaveBeenCalledWith('foo');
    });

    it('should call the SHA256 function with the stringifed input if it is not a string', () => {
      ChainUtils.hash([1, 2, 3]);

      expect(SHA256Spy).toHaveBeenCalledWith('[1,2,3]');
    });

    it('should return a hash', () => {
      const hash = ChainUtils.hash('foobar');

      expect(hash).toMatch(/^[a-z0-9]{64}$/);
    });
  });

  describe('verifySignature', () => {
    let keyFromPublicSpy: jest.Mock;
    let verifySpy: jest.Mock;

    beforeEach(() => {
      verifySpy = jest.fn();
      keyFromPublicSpy = jest.spyOn(EC.prototype, 'keyFromPublic')
        .mockReturnValue({ verify: verifySpy });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should call the keyFromPublic function with the provided public key', () => {
      const publicKey = 'foo';
      ChainUtils.verifySignature(publicKey, {} as Signature, 'bar');

      expect(keyFromPublicSpy).toHaveBeenCalledWith(publicKey, 'hex');
    });

    it('should call the verify function of the retrieved keypair with the data hash and signature', () => {
      const signature = {} as Signature;
      const dataHash = 'foobar';
      ChainUtils.verifySignature('123', signature, dataHash);

      expect(verifySpy).toHaveBeenCalledWith(dataHash, signature);
    });
  });
});

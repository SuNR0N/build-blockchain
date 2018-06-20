import elliptic from 'elliptic';

const EC = elliptic.ec;
const ec = new EC('secp256k1');

export class ChainUtils {
  public static generateKeyPair() {
    return ec.genKeyPair();
  }
}

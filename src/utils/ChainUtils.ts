import { SHA256 } from 'crypto-js';
import elliptic from 'elliptic';
import { v1 } from 'uuid';

const EC = elliptic.ec;
const ec = new EC('secp256k1');

export class ChainUtils {
  public static generateKeyPair(): elliptic.KeyPair {
    return ec.genKeyPair();
  }

  public static id(): string {
    return v1();
  }

  public static hash(data: any): string {
    const message: string = typeof data === 'string' ? data : JSON.stringify(data);
    return SHA256(message).toString();
  }
}

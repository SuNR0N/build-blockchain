import { SHA256 } from 'crypto-js';
import {
  ec as EC,
  KeyPair,
  Signature,
} from 'elliptic';
import { v1 } from 'uuid';

const ec = new EC('secp256k1');

export class ChainUtils {
  public static generateKeyPair(): KeyPair {
    return ec.genKeyPair();
  }

  public static id(): string {
    return v1();
  }

  public static hash(data: any): string {
    const message: string = typeof data === 'string' ? data : JSON.stringify(data);
    return SHA256(message).toString();
  }

  public static verifySignature(publicKey: string, signature: Signature, dataHash: string): boolean {
    return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
  }
}

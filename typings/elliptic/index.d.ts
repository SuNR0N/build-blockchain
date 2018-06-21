declare module 'elliptic' {
  interface Signature {
    r: string;
    s: string;
    recoveryParam: any;
  }

  interface KeyPair {
    getPublic(compact?: string, enc?: string): string;
    sign(message: string): Signature;
  }

  interface EC {
    genKeyPair(): KeyPair;
  }

  interface ECConstructor {
    new(name: string): EC;
  }

  const ec: ECConstructor;

}

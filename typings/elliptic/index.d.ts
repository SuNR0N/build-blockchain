declare module 'elliptic' {
  interface Signature {
    r: string;
    s: string;
    recoveryParam: any;
  }

  interface KeyPair {
    ec: EC;
    priv: string;
    pub: any;

    getPublic(compact?: string, enc?: string): string;
    sign(message: string): Signature;
    verify(msg: string, signature: Signature): boolean;
  }

  interface EC {
    genKeyPair(): KeyPair;
    keyFromPublic(pub: string, enc: string): KeyPair;
  }

  interface ECConstructor {
    new(name: string): EC;
  }

  const ec: ECConstructor;
}

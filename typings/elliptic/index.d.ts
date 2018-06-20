declare module 'elliptic' {
  interface KeyPair {
    getPublic(compact?: string, enc?: string): string;
  }

  interface EC {
    genKeyPair(): KeyPair;
  }

  interface ECConstructor {
    new(name: string): EC;
  }

  const ec: ECConstructor;

}

# build-blockchain

[Build a Blockchain and a Cryptocurrency from Scratch](https://www.udemy.com/build-blockchain/)

## Terminology

### Blockchain

The blockchain is a _distributed_ and _decentralized ledger_ that _stores data_ such as transactions, and that is publicly shared across all the nodes of its network.

### Cryptocurrency

A cryptocurrency is a _digital medium of exchange_ which leverages the blockchain and uses cryptography to generate digital signatures.

### Wallet

Object that stores the _balance_ of an individual alongside with a _private_ and _public key pair_. The _private key_ is used to generate digital signatures, while the _public key_ is used to verify signatures and it also serves as the address of the wallet.

### Mining

Temporarily _unconfirmed_ blocks of transactions can be added to the blockchain by solving a computationally expensive _proof of work_ algorithm. Once solved, the miner can add the block and the other miners will verify it. Miners are rewarded for adding a new block to the chain.

### Bitcoin

The first decentralized cryptocurrency in _2009_ developed by _Satoshi Nakamoto_.

### Genesis Block

Hardcoded block which serves as the origin of the blockchain.

### Proof of Work System

A system that requires miners to do computational work to add blocks to the chain and which makes it expensive to generate corrupt chains.

Based on a predefined _difficulty_ level, which sets the _rate of mining_, the system generates hashes until one with the matching criteria is found. A _nonce_ value is incremented within the block which facilitates the generation of a new hash.

### Transaction

An object which captures the information behind the exchange of currency between two individuals. Its _input fields_ (timestamp, balance, signature, sender's public key) provides details about the original sender while its _output fields_ (amount, address) describes the balance change of each individual.

### Transaction Pool

An object that contains all new and therefore _unconfirmed transactions_ submitted by individuals.

### Digital Signature

The digital signature is the hash value of the combination of the transactional data and the sender's private key.

The public key of the sender can be used to verify the signature.

## Install

```sh
yarn
```

## Run

```sh
yarn start
```

With multiple connected peers:

```sh
# Terminal #1
yarn start

# Terminal #2
PORT=3002 WS_PORT=5002 PEERS=ws://localhost:5001 yarn start

# Terminal #3
PORT=3003 WS_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 yarn start
```

## Test

```sh
yarn test
```

With coverage report:

```sh
yarn test:coverage
```

## TODO

- [ ] Reach 100% code coverage
- [X] Implement endpoint which returns the address book
- [ ] Implement transaction fees
- [ ] Set up docker compose for the p2p nodes
- [ ] Reduce the runtime of unit tests
# build-blockchain

[Build a Blockchain and a Cryptocurrency from Scratch](https://www.udemy.com/build-blockchain/)

## Terminology

### Blockchain

The blockchain is a _distributed_ and _decentralized ledger_ that _stores data_ such as transactions, and that is publicly shared across all the nodes of its network.

### Cryptocurrency

A cryptocurrency is a _digital medium of exchange_ which leverages the blockchain and uses cryptography to generate digital signatures.

### Wallet

Object that stores the _private_ and _public key pair_ of an individual and which is used to _sign_ the transactions.

### Mining

Temporarily _unconfirmed_ blocks of transactions can be added to the blockchain by solving a computationally expensive _proof of work_ algorithm. Once solved, the miner can add the block and the other miners will verify it. Miners are rewarded for adding a new block to the chain.

### Bitcoin

The first decentralized cryptocurrency in 2009.

### Genesis Block

Hardcoded block which serves as the origin of the blockchain.

### Proof of Work System

A system that requires miners to do computational work to add blocks to the chain and which makes it expensive to generate corrupt chains.

Based on a predefined _difficulty_ level, which sets the _rate of mining_, the system generates hashes until one with the matching criteria is found. A _nonce_ value is incremented within the block which facilitates the generation of a new hash.

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
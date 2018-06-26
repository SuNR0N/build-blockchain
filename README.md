# build-blockchain

[Build a Blockchain and a Cryptocurrency from Scratch](https://www.udemy.com/build-blockchain/)

Table of Contents

* [Terminology](#terminology)
    * [Bitcoin](#bitcoin)
    * [Blockchain](#blockchain)
    * [Cryptocurrency](#cryptocurrency)
    * [Digital Signature](#digital-signature)
    * [Genesis Block](#genesis-block)
    * [Mining](#mining)
    * [Proof of Work System](#proof-of-work-system)
    * [Transaction](#transaction)
    * [Transaction Pool](#transaction-pool)
    * [Wallet](#wallet)
* [Install](#install)
* [Run](#run)
    * [Environment Variables](#environment-variables)
* [Test](#test)
* [Debug](#debug)
* [TODO](#todo)

## Terminology

### Bitcoin

The first decentralized cryptocurrency in _2009_ developed by _Satoshi Nakamoto_.

### Blockchain

The blockchain is a _distributed_ and _decentralized ledger_ that _stores data_ such as transactions, and that is publicly shared across all the nodes of its network.

### Cryptocurrency

A cryptocurrency is a _digital medium of exchange_ which leverages the blockchain and uses cryptography to generate digital signatures.

### Digital Signature

The digital signature is the hash value of the combination of the transactional data and the sender's private key.

The public key of the sender can be used to verify the signature.

### Genesis Block

Hardcoded block which serves as the origin of the blockchain.

### Mining

Temporarily _unconfirmed_ blocks of transactions can be added to the blockchain by solving a computationally expensive _proof of work_ algorithm. Once solved, the miner can add the block and the other miners will verify it. Miners are rewarded for adding a new block to the chain.

### Proof of Work System

A system that requires miners to do computational work to add blocks to the chain and which makes it expensive to generate corrupt chains.

Based on a predefined _difficulty_ level, which sets the _rate of mining_, the system generates hashes until one with the matching criteria is found. A _nonce_ value is incremented within the block which facilitates the generation of a new hash.

### Transaction

An object which captures the information behind the exchange of currency between two individuals. Its _input fields_ (timestamp, balance, signature, sender's public key) provides details about the original sender while its _output fields_ (amount, address) describes the balance change of each individual.

### Transaction Pool

An object that contains all new and therefore _unconfirmed transactions_ submitted by individuals.

### Wallet

Object that stores the _balance_ of an individual alongside with a _private_ and _public key pair_. The _private key_ is used to generate digital signatures, while the _public key_ is used to verify signatures and it also serves as the address of the wallet.

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

### Environment Variables

```sh
# The HTTP port on which the Express server will listen
PORT=3001

# The WebSocket port on which the P2P server will listen
WS_PORT=5001

# The comma separated list of WebSocket addresses to which the P2P server will join on start
PEERS=

# The initial diffculty of the proof-of-work algorithm which sets how many prefixing zeros the block hash must have  
DIFFICULTY=

# The average amount of time (ms) required to successfully mine a new block
MINE_RATE=
```

## Test

```sh
yarn test
```

With coverage report:

```sh
yarn test:coverage
```

## Debug

If you're using _VS Code_ then you can set up your debug _configurations_ within your _launch.json_ file based on the following code snippet to be able to easily debug a particular TypeScript / Jest file or the whole application:

```json
{
    "name": "Current TS File",
    "type": "node",
    "request": "launch",
    "args": [
        "${relativeFile}"
    ],
    "runtimeArgs": [
        "-r",
        "ts-node/register"
    ],
    "cwd": "${workspaceRoot}",
    "protocol": "inspector",
    "internalConsoleOptions": "openOnSessionStart"
},
{
    "name": "Current Jest Test",
    "type": "node",
    "request": "launch",
    "program": "${workspaceFolder}/node_modules/.bin/jest",
    "args": [
        "${relativeFile}"
    ],
    "console": "integratedTerminal",
    "internalConsoleOptions": "neverOpen"
},
{
    "name": "Application",
    "type": "node",
    "request": "launch",
    "args": [
        "src/app.ts"
    ],
    "runtimeArgs": [
        "-r",
        "ts-node/register"
    ],
    "cwd": "${workspaceRoot}",
    "protocol": "inspector",
    "internalConsoleOptions": "openOnSessionStart"
}
```

## TODO

- [ ] Reach 100% code coverage
- [X] Implement endpoint which returns the address book
- [ ] Implement transaction fees
- [ ] Set up docker compose for the p2p nodes
- [X] Reduce the runtime of unit tests
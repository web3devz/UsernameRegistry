# UsernameRegistry 🪪

**Decentralized Naming System on OneChain — Own Your Username, Own Your Identity**

UsernameRegistry is a fully on-chain naming system that allows users to claim, own, and manage unique usernames tied to their wallet. It replaces fragmented Web2 usernames with a **portable, verifiable, and censorship-resistant identity layer** for Web3.

## 🌐 Overview

In Web2, usernames are controlled by centralized platforms — they can be taken, restricted, or removed at any time. Users cannot carry their identity across applications.

UsernameRegistry solves this by creating a **shared on-chain registry** where usernames are:

* **Unique** → no duplicates across the network
* **User-Owned** → stored as wallet-owned objects
* **Portable** → usable across any dApp
* **Censorship-Resistant** → no central authority control

This establishes a universal identity layer that can integrate with any decentralized application.

## ❗ The Problem

* Usernames are platform-specific and non-transferable
* Centralized systems control identity ownership
* No global namespace in Web3
* Risk of censorship or account loss
* Difficult to verify identity across dApps

## 💡 The Solution

UsernameRegistry maintains a **shared on-chain Registry object** that maps usernames to wallet addresses.

When a user claims a username:

* It is minted as an owned on-chain object
* Stored permanently and uniquely
* Verifiable by any application
* Transferable or releasable by the owner

This creates a **decentralized username layer** for the entire ecosystem.

## ✨ Key Features

* **Unique Username Claiming**
  Register globally unique handles on-chain

* **Wallet-Based Ownership**
  Usernames are owned assets stored in your wallet

* **Real-Time Availability Check**
  Instantly verify if a username is available

* **Release Mechanism**
  Users can release usernames back to the registry

* **Efficient Lookup System**
  O(1) uniqueness checks using on-chain table structures

* **Composable Identity Primitive**
  Can integrate with profiles, reputation, and dApps

## ⚙️ How It Works

1. User connects wallet
2. Inputs desired username
3. System checks availability on-chain
4. User submits transaction to claim username
5. Username object is minted to wallet
6. dApps can query registry to verify ownership

## 📦 Deployed Contract

* **Network:** OneChain Testnet

* **Package ID:**
  `0xf9b680b02524aeb3bccd843ef1f0a9eeb316b7dce178a5e58333464247805100`

* **Registry Object:**
  `0x2a02e1e1eda1a175361fbcd68d2aa634afecfde3b08992e5f6756aaf06035d37`

* **Deploy Transaction:**
  `CUFd9zbib4562F7ZKkZ4sLAR6VXMBMESFwMwvsPPBMn9`

* **Explorer Links:**
  [https://onescan.cc/testnet/objectDetails?address=0xf9b680b02524aeb3bccd843ef1f0a9eeb316b7dce178a5e58333464247805100](https://onescan.cc/testnet/objectDetails?address=0xf9b680b02524aeb3bccd843ef1f0a9eeb316b7dce178a5e58333464247805100)
  [https://onescan.cc/testnet/objectDetails?address=0x2a02e1e1eda1a175361fbcd68d2aa634afecfde3b08992e5f6756aaf06035d37](https://onescan.cc/testnet/objectDetails?address=0x2a02e1e1eda1a175361fbcd68d2aa634afecfde3b08992e5f6756aaf06035d37)
  [https://onescan.cc/testnet/transactionDetail?digest=CUFd9zbib4562F7ZKkZ4sLAR6VXMBMESFwMwvsPPBMn9](https://onescan.cc/testnet/transactionDetail?digest=CUFd9zbib4562F7ZKkZ4sLAR6VXMBMESFwMwvsPPBMn9)

## 🛠 Tech Stack

**Smart Contract**

* Move (OneChain)

**Frontend**

* React
* TypeScript
* Vite

**Wallet Integration**

* @mysten/dapp-kit

**Data Structures**

* `one::table::Table` for efficient username mapping

**Network**

* OneChain Testnet

## 🔍 Use Cases

* **Decentralized Identity Systems**
  Replace traditional usernames across dApps

* **Social Platforms**
  Unified identity across multiple applications

* **DAO Membership & Profiles**
  Human-readable identities for governance

* **Reputation Systems**
  Link usernames with trust scores (ReputationScore)

* **Web3 Login Systems**
  Use usernames instead of wallet addresses

## 🚀 Why UsernameRegistry Stands Out

* **True Ownership** — usernames live in your wallet
* **Global Namespace** — one identity across all dApps
* **Censorship Resistant** — no centralized control
* **Efficient & Scalable** — O(1) lookup design
* **Composable Infrastructure** — integrates with identity, reputation, and profiles
* **Hackathon-Ready Utility** — foundational Web3 primitive

## 🔮 Future Improvements

* ENS-style human-readable domains
* Username auctions for premium handles
* Cross-chain username resolution
* Integration with ChainProfile for unified identity
* Reverse lookup (address → username)
* ZK-based private username ownership

## ⚙️ Contract API

```move id="p9x2kl"
// Claim a unique username (min 3 chars, lowercase alphanumeric + underscore)
public fun claim(registry: &mut Registry, raw_handle: vector<u8>, ctx: &mut TxContext)

// Release a username back to the registry
public fun release(registry: &mut Registry, username: Username, ctx: &mut TxContext)

// Check if a handle is available
public fun is_available(registry: &Registry, handle: String): bool

// Total claimed usernames
public fun total(registry: &Registry): u64
```

## 💻 Local Development

### Prerequisites

* OneChain CLI (`one`)
* Node.js 18+

### Build & Deploy Contract

```bash id="v2k9lm"
one move build --path contracts
one client publish --gas-budget 50000000 contracts
```

After deploying, set environment variables:

```env id="n4p8xz"
VITE_PACKAGE_ID=<your_package_id>
VITE_REGISTRY_ID=<your_registry_object_id>
```

### Run Frontend

```bash id="q7m2za"
cd frontend
npm install
npm run dev
```

## 📄 License

MIT License

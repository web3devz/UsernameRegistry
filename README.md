# UsernameRegistry

A decentralized naming system built on **OneChain** that lets users claim and own unique usernames on-chain. Unlike Web2 systems where usernames are platform-dependent and controlled by centralized entities, UsernameRegistry ensures ownership through wallet-based identity.

All usernames are stored on-chain — transparent, unique, and censorship-resistant. Users maintain a consistent identity across any decentralized platform that reads the registry.

---

## Deployed Contracts (Testnet)

| Name | Address |
|------|---------|
| Package ID | `0xf9b680b02524aeb3bccd843ef1f0a9eeb316b7dce178a5e58333464247805100` |
| Registry (shared object) | `0x2a02e1e1eda1a175361fbcd68d2aa634afecfde3b08992e5f6756aaf06035d37` |
| Deploy Transaction | `CUFd9zbib4562F7ZKkZ4sLAR6VXMBMESFwMwvsPPBMn9` |

- [View Package on Explorer](https://onescan.cc/testnet/objectDetails?address=0xf9b680b02524aeb3bccd843ef1f0a9eeb316b7dce178a5e58333464247805100)
- [View Registry on Explorer](https://onescan.cc/testnet/objectDetails?address=0x2a02e1e1eda1a175361fbcd68d2aa634afecfde3b08992e5f6756aaf06035d37)
- [View Deploy Transaction](https://onescan.cc/testnet/transactionDetail?digest=CUFd9zbib4562F7ZKkZ4sLAR6VXMBMESFwMwvsPPBMn9)

---

## How It Works

1. **Connect Wallet** — any OneChain-compatible wallet
2. **Check Availability** — real-time on-chain availability check as you type
3. **Claim** — one transaction mints a `Username` object into your wallet
4. **Use Everywhere** — any dApp can verify ownership by querying the shared Registry

### Key Design Decisions

- **Shared Registry** — the `Registry` object is shared so anyone can call `claim` without needing the deployer's object
- **Table for uniqueness** — uses `one::table::Table<String, address>` for O(1) duplicate checks instead of a linear vector scan
- **Owned Username object** — the minted `Username` has `key + store`, so it lives in your wallet and can be transferred or burned
- **Release** — owners can release their username back to the registry, making it available for others

---

## Contract API

```move
// Claim a unique username (min 3 chars, lowercase alphanumeric + underscore)
public fun claim(registry: &mut Registry, raw_handle: vector<u8>, ctx: &mut TxContext)

// Release a username back to the registry
public fun release(registry: &mut Registry, username: Username, ctx: &mut TxContext)

// Check if a handle is available
public fun is_available(registry: &Registry, handle: String): bool

// Total claimed usernames
public fun total(registry: &Registry): u64
```

---

## Local Development

### Prerequisites

- [OneChain CLI](https://docs.onelabs.cc) (`one` binary)
- Node.js 18+

### Build & Deploy Contract

```bash
# Build
one move build --path contracts

# Deploy
one client publish --gas-budget 50000000 contracts
```

After deploying, copy the `PackageID` and `Registry` object ID into `frontend/.env`:

```env
VITE_PACKAGE_ID=<your_package_id>
VITE_REGISTRY_ID=<your_registry_object_id>
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
UsernameRegistry/
├── contracts/
│   ├── Move.toml
│   └── sources/
│       └── registry.move      # Core contract
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClaimUsername.tsx   # Claim flow with live availability check
│   │   │   ├── MyUsername.tsx      # View & release owned username
│   │   │   └── LookupUsername.tsx  # Lookup by wallet address
│   │   ├── config/network.ts       # Contract addresses & explorer helpers
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── .env.example
└── scripts/
    └── deploy.sh
```

---

## License

MIT

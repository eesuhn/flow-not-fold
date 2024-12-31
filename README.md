# Flow Not Fold

"Flow Not Fold" is a decentralized 1v1 poker application built on the **Flow blockchain**. It leverages Flow's high throughput, low-cost transactions, and native support for randomness via **Verifiable Random Function (VRF)** to ensure fair and transparent gameplay. Designed for seamless user experience, the app combines modern web technologies like **Next.js** and **Bun** with the power of Flow's smart contract ecosystem.

## Key Features 🎮

- **1v1 Poker Game**: Play against another player in real-time with provably fair randomness.
- **Flow Blockchain Integration**: Immutable and transparent transaction records with low gas fees.
- **Verifiable Randomness**: Guaranteed unbiased game outcomes using Flow's VRF.
- **Modern Web Framework**: Built with Next.js for a smooth and responsive user interface.
- **Bun-Powered Development**: Ultra-fast dependency installation, bundling, and runtime.

## Getting Started 🚀

> [!WARNING]
> Install **Bun** before proceeding:
>
> ```bash
> curl -fsSL https://bun.sh/install | bash
> ```

### Steps to Start the Project

1. **Install Dependencies**

   ```bash
   bun install
   ```

2. **Start the Development Server**

   ```bash
   bun run dev
   ```

3. **Run Flow Emulator and Deploy Contracts**

   ```bash
   bun run local
   bun run deploy:local
   ```

4. **Test Functionality**
   ```bash
   bun run test
   ```

## Project Structure 🌴

```
.
├── contracts                      # Cadence smart contracts
│   └── PokerContract.cdc          # Main game logic
├── next-client
│   ├── public                     # Public assets
│   └── src                        # Frontend source (Next.js)
├── scripts
│   └── deploy.ts                  # Script for deploying contracts
└── test                           # Tests for contracts and application
    └── PokerContractTest.ts       # End-to-end testing
```

## Deployment 🌐

### Environment Setup

1. Create a `.env` file by copying `.env.example`
2. Populate the environment variables as required
3. For local development, not all fields are necessary

## Technologies Used 💡

- **Flow Blockchain**: High-performance blockchain designed for games and dApps
- **Next.js**: React framework for building scalable web applications
- **Bun**: Lightning-fast JavaScript runtime and bundler
- **Cadence**: Secure and resource-oriented smart contract language for Flow

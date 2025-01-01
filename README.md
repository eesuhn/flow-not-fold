# Flow not Fold!

![nextjs][nextjs] ![hardhat][hardhat] ![ethers][ethers] ![shadcn][shadcn] ![bun][bun]

"Flow Not Fold" is a decentralized 1v1 poker application built on the **Flow blockchain**. It leverages Flow's high throughput, low-cost transactions, and native support for randomness via **Verifiable Random Function (VRF)** to ensure fair and transparent gameplay.

## Key Features 🎮

- **1v1 Poker Game**: Play against another player in real-time with provably fair randomness.
- **Flow Blockchain Integration**: Immutable and transparent transaction records with low gas fees.
- **Verifiable Randomness**: Guaranteed unbiased game outcomes using Flow's VRF.

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

[nextjs]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white
[hardhat]: https://img.shields.io/badge/Hardhat-f0d614?style=for-the-badge&logo=hardhat&logoColor=white
[ethers]: https://img.shields.io/badge/ethers.js-6651FF?style=for-the-badge&logo=ethereum&logoColor=white
[shadcn]: https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcn/ui&logoColor=white
[bun]: https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff&style=for-the-badge

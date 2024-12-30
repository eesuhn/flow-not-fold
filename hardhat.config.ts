import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import { environment } from './config/environment';

// Default wallet key for local development
const walletKey =
  environment.walletPrivateKey ||
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.27',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: 'http://127.0.0.1:8545',
      accounts: [walletKey],
      // chainId: 31337,  // We don't verify in localhost
    },
    ...(environment.chainConfig && {
      chain: {
        url: environment.chainConfig.rpcUrl,
        accounts: [walletKey],
        chainId: environment.chainConfig.chainId,
      },
    }),
  },
  etherscan: {
    apiKey: environment.chainConfig?.apiKey || '',
    customChains: environment.chainConfig
      ? [
          {
            network: environment.chainConfig.name,
            chainId: environment.chainConfig.chainId,
            urls: {
              apiURL: environment.chainConfig.explorerApiUrl,
              browserURL: environment.chainConfig.explorerUrl,
            },
          },
        ]
      : [],
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;

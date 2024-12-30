import { NetworksUserConfig } from 'hardhat/types';
import { environment } from './environment';
import { logWarning, logError } from '../utils/logger';

const validateDeploymentConfig = (networkName: string = 'unknown'): boolean => {
  const { chainConfig, walletPrivateKey } = environment;

  if (networkName === 'localhost') return true;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!chainConfig) {
    errors.push(`${networkName.toUpperCase()} chain configuration is missing`);
  }

  if (!walletPrivateKey) {
    errors.push('WALLET_PRIVATE_KEY is missing');
  }

  if (chainConfig?.rpcUrl && !chainConfig.rpcUrl.startsWith('https://')) {
    warnings.push('RPC URL should use HTTPS for production deployments');
  }

  if (warnings.length) {
    logWarning(
      'Configuration warnings:\n' + warnings.map((w) => `- ${w}`).join('\n')
    );
  }

  if (errors.length && process.env.npm_lifecycle_event !== 'deploy:local') {
    logError(
      'Configuration errors:\n' + errors.map((e) => `- ${e}`).join('\n')
    );
  }

  return errors.length === 0;
};

const baseNetworkConfig = {
  mining: {
    auto: true,
    interval: 1000,
  },
};

export const networks: NetworksUserConfig = {
  hardhat: baseNetworkConfig,
  localhost: {
    ...baseNetworkConfig,
    url: 'http://127.0.0.1:8545',
    chainId: 31337,
  },
  ...(validateDeploymentConfig(environment.chainConfig?.name) &&
    environment.chainConfig && {
      [environment.chainConfig.name]: {
        url: environment.chainConfig.rpcUrl,
        accounts: [environment.walletPrivateKey!],
        chainId: environment.chainConfig.chainId,
        verify: {
          etherscan: {
            apiKey: environment.chainConfig.apiKey,
          },
        },
      },
    }),
};

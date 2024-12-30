import dotenv from 'dotenv';
import { ChainConfig, EnvironmentConfig } from './types';

dotenv.config();

const DEFAULT_BLOCK_CONFIRMATIONS = 30000;
const REQUIRED_CHAIN_FIELDS = [
  'name',
  'chainId',
  'rpcUrl',
  'explorerUrl',
  'explorerApiUrl',
  'apiKey',
] as const;

const getChainConfig = (): ChainConfig | null => {
  const envFields = {
    name: process.env.CHAIN_NAME?.toLowerCase(),
    chainId: process.env.CHAIN_ID,
    rpcUrl: process.env.RPC_URL,
    explorerUrl: process.env.EXPLORER_URL,
    explorerApiUrl: process.env.EXPLORER_API_URL,
    apiKey: process.env.EXPLORER_API_KEY,
  };

  const missingFields = REQUIRED_CHAIN_FIELDS.filter(
    (field) => !envFields[field]
  );

  // WIP: Handle missing fields
  if (missingFields.length) {
    return null;
  }

  return {
    ...envFields,
    chainId: parseInt(envFields.chainId!),
  } as ChainConfig;
};

export const environment: EnvironmentConfig = {
  walletPrivateKey: process.env.WALLET_PRIVATE_KEY,
  chainConfig: getChainConfig(),
  blockConfirmations: parseInt(
    process.env.BLOCK_CONFIRMATIONS || String(DEFAULT_BLOCK_CONFIRMATIONS)
  ),
  autoVerify: process.env.AUTO_VERIFY === 'true',
};

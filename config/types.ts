export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  explorerApiUrl: string;
  apiKey: string;
}

export interface EnvironmentConfig {
  walletPrivateKey: string | undefined;
  chainConfig: ChainConfig | null;
  blockConfirmations: number;
  autoVerify: boolean;
}

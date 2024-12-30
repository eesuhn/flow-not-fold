import { DeploymentConfig } from './types';

export const deploymentContracts: DeploymentConfig[] = [
  {
    contractName: 'PokerContract',
    verify: true,
    args: ['0x0000000000000000000000010000000000000001'],
  },
  {
    contractName: 'MockCadenceArch',
    verify: true,
  },
];

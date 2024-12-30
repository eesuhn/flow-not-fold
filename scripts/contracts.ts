import { DeploymentConfig } from './types';

export const deploymentContracts: DeploymentConfig[] = [
  // Sample contract
  {
    contractName: 'SampleContract',
    verify: true,
    args: ['Hello, Hardhat!'],
  },
];

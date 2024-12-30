import path from 'path';
import fs from 'fs';
import { ethers, network, run } from 'hardhat';
import { logInfo, logSuccess, logError, logWarning } from '../utils/logger';
import { environment } from '../config/environment';
import { DeploymentConfig } from './types';
import { deploymentContracts } from './contracts';

class ContractDeployer {
  private deployedContracts: Map<string, string> = new Map();

  constructor(
    private readonly blockConfirmationWait: number = environment.blockConfirmations,
    private readonly contracts: DeploymentConfig[] = []
  ) {}

  /**
   * Get a list of available contracts in the contracts directory
   *
   * @returns List of available contracts in the contracts directory
   */
  static async getAvailableContracts(): Promise<string[]> {
    const contractsPath = path.join(process.cwd(), 'contracts');
    try {
      const files = await fs.promises.readdir(contractsPath);
      return files
        .filter((file) => file.endsWith('.sol'))
        .map((file) => path.parse(file).name);
    } catch (error) {
      logError(`Error reading contracts directory: ${error}`);
      return [];
    }
  }

  /**
   * Deploy all contracts in the deployment configuration
   *
   * @returns Map of deployed contract names to their addresses
   */
  async deployAll(): Promise<Map<string, string>> {
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await deployer.provider.getBalance(
      deployer.address
    );

    this.logPreDeploymentInfo(deployer.address, deployerBalance);

    const availableContracts = await ContractDeployer.getAvailableContracts();
    logInfo('\nAvailable contracts:');
    logInfo('-------------------');
    availableContracts.forEach((contract) => logInfo(`- ${contract}`));

    // Filter configurations to only include available contracts
    const validConfigs = this.contracts.filter((config) => {
      const isAvailable = availableContracts.includes(config.contractName);
      if (!isAvailable) {
        logWarning(
          `Skipping ${config.contractName} - contract not found in contracts directory`
        );
      }
      return isAvailable;
    });

    if (validConfigs.length === 0) {
      logWarning('No valid contracts to deploy');
      return this.deployedContracts;
    }

    for (const config of validConfigs) {
      try {
        const address = await this.deploySingleContract(config);
        this.deployedContracts.set(config.contractName, address);

        if (config.verify && !['hardhat', 'localhost'].includes(network.name)) {
          await this.verifyContract(address, config.args || []);
        }
      } catch (error) {
        logError(`Failed to deploy ${config.contractName}: ${error}`);
        throw error;
      }
    }

    return this.deployedContracts;
  }

  /**
   * Deploy a single contract based on the deployment configuration
   *
   * @param config
   * @returns
   */
  private async deploySingleContract(
    config: DeploymentConfig
  ): Promise<string> {
    const { contractName, args = [], dependencies = {} } = config;

    // Replace dependency addresses in constructor args
    const resolvedArgs = args.map((arg) =>
      typeof arg === 'string' && arg.startsWith('$')
        ? this.deployedContracts.get(arg.slice(1))
        : arg
    );

    // Verify all required dependencies are deployed
    for (const [depName, depAddress] of Object.entries(dependencies)) {
      if (!this.deployedContracts.has(depName)) {
        throw new Error(
          `Dependency ${depName} (${depAddress}) not deployed for ${contractName}`
        );
      }
    }

    logInfo(`\nDeploying ${contractName}...`);
    if (resolvedArgs.length > 0) {
      logInfo(`Constructor arguments: ${resolvedArgs.join(', ')}`);
    }

    try {
      const Contract = await ethers.getContractFactory(contractName);
      const contract = await Contract.deploy(...resolvedArgs);
      const address = await contract.getAddress();

      const deploymentInfo = await this.getDeploymentInfo(address);
      this.logDeploymentInfo(contractName, deploymentInfo);

      return address;
    } catch (error) {
      throw new Error(`Deployment failed for ${contractName}: ${error}`);
    }
  }

  /**
   * Verify a deployed contract on Scan
   *
   * @param address
   * @param constructorArgs
   * @returns
   */
  async verifyContract(address: string, constructorArgs: any[] = []) {
    if (!environment.autoVerify) {
      logInfo('Skipping contract verification (AUTO_VERIFY is disabled)');
      return;
    }

    logInfo('Starting contract verification...');
    await this.waitForConfirmations();

    try {
      await run('verify:verify', {
        address,
        constructorArguments: constructorArgs,
      });
      logSuccess('Contract verified successfully!');
    } catch (error: any) {
      this.handleVerificationError(error, address, constructorArgs);
    }
  }

  /**
   * Wait for block confirmations before verifying the contract
   */
  private async waitForConfirmations() {
    logInfo('Waiting for block confirmations...');
    await new Promise((resolve) =>
      setTimeout(resolve, this.blockConfirmationWait)
    );
  }

  /**
   * Handle verification error
   *
   * @param error
   * @param address
   * @param args
   * @returns
   */
  private handleVerificationError(error: any, address: string, args: any[]) {
    if (error?.message?.toLowerCase().includes('already verified')) {
      logInfo('Contract is already verified!');
      return;
    }

    logError(`Verification error: ${error}`);
    const argsString = args.length ? args.join(' ') : '';
    logInfo(
      `For manual verification:\nbunx hardhat verify --network ${network.name} ${address} ${argsString}`
    );
  }

  /**
   * Get deployment information
   *
   * @param address
   * @returns
   */
  private async getDeploymentInfo(address: string) {
    const blockNumber = await ethers.provider.getBlockNumber();
    const { gasPrice } = await ethers.provider.getFeeData();
    const block = await ethers.provider.getBlock(blockNumber);

    return {
      address,
      network: network.name,
      blockNumber,
      gasPrice: gasPrice ? ethers.formatUnits(gasPrice, 'gwei') : 'unknown',
      timestamp: block?.timestamp
        ? new Date(block.timestamp * 1000).toISOString()
        : 'unknown',
    };
  }

  /**
   * Log pre-deployment information
   *
   * @param address
   * @param balance
   */
  private logPreDeploymentInfo(address: string, balance: bigint) {
    const chainConfigName = environment.chainConfig?.name || 'unknown';
    const networkName =
      network.name === 'localhost' ? 'localhost' : chainConfigName;

    logInfo('\nDeployment configuration:');
    logInfo('------------------------');
    logInfo(`Network: ${networkName}`);
    logInfo(`Deployer: ${address}`);
    logInfo(`Balance: ${ethers.formatEther(balance)} ETH`);
  }

  /**
   * Log deployment information
   *
   * @param contractName
   * @param info
   */
  private logDeploymentInfo(contractName: string, info: Record<string, any>) {
    logSuccess(`\n${contractName} deployed successfully!`);
    logInfo('\nDeployment details:');
    logInfo('------------------');
    Object.entries(info).forEach(([key, value]) => logInfo(`${key}: ${value}`));
  }
}

/**
 * Main deployment function
 */
async function main() {
  try {
    const deployer = new ContractDeployer(
      environment.blockConfirmations,
      deploymentContracts
    );
    const deployedContracts = await deployer.deployAll();

    if (deployedContracts.size > 0) {
      logSuccess('\nAll contracts deployed successfully!');
      logInfo('\nDeployed Contracts:');
      logInfo('------------------');
      deployedContracts.forEach((address, name) => {
        logInfo(`${name}: ${address}`);
      });
    }
  } catch (error) {
    logError(`Deployment failed: ${error}`);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logError(error);
    process.exit(1);
  });

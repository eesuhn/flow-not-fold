export interface DeploymentConfig {
  contractName: string;
  args?: any[];
  verify?: boolean;
  dependencies?: {
    [key: string]: string; // contract name -> deployed address
  };
  proxy?: {
    admin?: string;
    implementation?: string;
  };
}

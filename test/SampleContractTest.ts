import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('SampleContract', function () {
  it('Should return the correct message', async function () {
    const message = 'Hello, Hardhat!';

    const SampleContract = await ethers.getContractFactory('SampleContract');
    const contract = await SampleContract.deploy(message);

    expect(await contract.getMessage()).to.equal(message);
  });
});

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import type { PokerContract } from '../typechain-types';

describe('PokerContract', function () {
  let poker: PokerContract;
  let mockCadenceArch: any;
  let owner: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;
  const MIN_ENTRY_FEE = ethers.parseEther('1');
  const GAME_ID = 1;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    const MockCadenceArch = await ethers.getContractFactory('MockCadenceArch');
    mockCadenceArch = (await MockCadenceArch.deploy()) as any;

    const PokerContract = await ethers.getContractFactory('PokerContract');
    poker = (await PokerContract.deploy(
      await mockCadenceArch.getAddress()
    )) as PokerContract;
  });

  describe('Game Creation', function () {
    it('Should create a game with minimum entry fee', async function () {
      const tx = await poker.connect(player1).createGame(GAME_ID, {
        value: MIN_ENTRY_FEE,
      });

      await expect(tx)
        .to.emit(poker, 'GameCreated')
        .withArgs(GAME_ID, player1.address, MIN_ENTRY_FEE);

      const game = await poker.games(GAME_ID);
      expect(game.player1).to.equal(player1.address);
      expect(game.state).to.equal(1); // WAITING
      expect(game.pool).to.equal(MIN_ENTRY_FEE);
    });

    it('Should fail with insufficient entry fee', async function () {
      await expect(
        poker.connect(player1).createGame(GAME_ID, {
          value: MIN_ENTRY_FEE - 1n,
        })
      ).to.be.revertedWith('Insufficient entry fee');
    });
  });

  describe('Game Joining', function () {
    beforeEach(async function () {
      await poker.connect(player1).createGame(GAME_ID, {
        value: MIN_ENTRY_FEE,
      });
    });

    it('Should allow player2 to join game', async function () {
      const tx = await poker.connect(player2).joinGame(GAME_ID, {
        value: MIN_ENTRY_FEE,
      });

      await expect(tx)
        .to.emit(poker, 'GameJoined')
        .withArgs(GAME_ID, player2.address, MIN_ENTRY_FEE * 2n);

      const game = await poker.games(GAME_ID);
      expect(game.player2).to.equal(player2.address);
      expect(game.state).to.equal(2); // ACTIVE
    });

    it('Should fail if player1 tries to join own game', async function () {
      await expect(
        poker.connect(player1).joinGame(GAME_ID, {
          value: MIN_ENTRY_FEE,
        })
      ).to.be.revertedWith('Already in game');
    });
  });

  describe('Game Cancellation', function () {
    beforeEach(async function () {
      await poker.connect(player1).createGame(GAME_ID, {
        value: MIN_ENTRY_FEE,
      });
    });

    it('Should allow player1 to cancel waiting game', async function () {
      const tx = await poker.connect(player1).cancelGame(GAME_ID);

      await expect(tx).to.emit(poker, 'GameCancelled').withArgs(GAME_ID);

      const game = await poker.games(GAME_ID);
      expect(game.state).to.equal(0); // EMPTY
    });

    it('Should allow timeout cancellation', async function () {
      await ethers.provider.send('evm_increaseTime', [3600]);
      await ethers.provider.send('evm_mine', []);

      const tx = await poker.connect(player2).cancelGame(GAME_ID);
      await expect(tx).to.emit(poker, 'GameCancelled').withArgs(GAME_ID);
    });
  });

  describe('Game Completion', function () {
    beforeEach(async function () {
      await poker
        .connect(player1)
        .createGame(GAME_ID, { value: MIN_ENTRY_FEE });
      await poker.connect(player2).joinGame(GAME_ID, { value: MIN_ENTRY_FEE });
    });

    it('Should allow winner to claim winnings', async function () {
      // Replace manual storage manipulation with the helper function:
      await poker.forceCompleteGame(GAME_ID);

      const tx = await poker.connect(player1).claimWinnings(GAME_ID);
      const totalPool = MIN_ENTRY_FEE * 2n;
      const commission = (totalPool * 25n) / 1000n;
      const winnings = totalPool - commission;

      await expect(tx)
        .to.emit(poker, 'GameCompleted')
        .withArgs(GAME_ID, await player1.getAddress(), winnings);
    });
  });

  describe('Admin Functions', function () {
    it('Should allow owner to modify timeout', async function () {
      const newTimeout = 7200;
      await poker.connect(owner).setGameTimeout(newTimeout);
      expect(await poker.gameTimeout()).to.equal(newTimeout);
    });

    it('Should allow owner to modify commission', async function () {
      const newCommission = 30;
      await poker.connect(owner).setHouseCommission(newCommission);
      expect(await poker.houseCommission()).to.equal(newCommission);
    });
  });
});

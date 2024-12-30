'use client';

import { useState, useEffect } from 'react';
import { OKXUniversalConnectUI, THEME } from '@okxconnect/ui';
import { ethers, providers } from 'ethers';

const contractAddress = '0xd891c181de0cA74C49D0fd5A544f56bE18cf707A'; // Replace with your actual contract address
const contractAbi = [
  {
    inputs: [],
    name: 'MIN_ENTRY_FEE',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cadenceArch',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'games',
    outputs: [
      {
        internalType: 'address',
        name: 'player1',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'player2',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'gameActive',
        type: 'bool',
      },
      {
        internalType: 'bool',
        name: 'winningsWithdrawn',
        type: 'bool',
      },
      {
        internalType: 'uint256',
        name: 'pool',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
    ],
    name: 'playGame',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vrf',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'gameId',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
];

export default function Home() {
  const [universalUi, setUniversalUi] = useState<any>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [gameId, setGameId] = useState<number>(1); // Replace with the gameId you want to play

  // Initialize OKX Connect UI on load
  useEffect(() => {
    const initOKX = async () => {
      const session = await OKXUniversalConnectUI.init({
        dappMetaData: {
          icon: 'https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png',
          name: 'OKX Connect Demo',
        },
        actionsConfiguration: {
          returnStrategy: 'tg://resolve',
          modals: 'all',
          tmaReturnUrl: 'back',
        },
        language: 'en_US',
        uiPreferences: {
          theme: THEME.LIGHT,
        },
      });

      setUniversalUi(session);
    };

    initOKX();
  }, []);

  // Connect Wallet function
  const connectWallet = async () => {
    if (!universalUi) return;

    const session = await universalUi.openModal({
      namespaces: {
        eip155: {
          chains: ['eip155:545'], // Chain ID for Flow EVM Testnet
          defaultChain: '545',
        },
      },
      optionalNamespaces: {
        eip155: {
          chains: ['eip155:545'], // Optional for custom networks
        },
      },
    });

    if (session?.namespaces?.eip155?.accounts?.[0]) {
      setWalletAddress(session?.namespaces?.eip155?.accounts[0]);
      setConnected(true);
    }
  };

  // Encode playGame function
  const encodePlayGameData = (gameId: number) => {
    const provider = new providers.JsonRpcProvider(
      'https://testnet.evm.nodes.onflow.org/'
    );
    provider.getBlockNumber().then(console.log).catch(console.error);
    const contract = new ethers.Contract(
      contractAddress,
      contractAbi,
      provider
    );
    return contract.interface.encodeFunctionData('playGame', [gameId]);
  };

  // Play Game function
  const playGame = async () => {
    if (!connected || !walletAddress) {
      alert('Please connect your wallet first.');
      return;
    }

    const encodedData =
      '0x5873533d0000000000000000000000000000000000000000000000000000000000000006';

    const data = {
      method: 'eth_sendTransaction',
      params: [
        {
          from: walletAddress.split(':')[2], // Extract address from session
          to: contractAddress,
          value: ethers.utils.parseEther('1.0').toString(), // Example value in Wei
          data: encodedData,
        },
      ],
    };

    try {
      const result = await universalUi.request(data, 'eip155:545', 'all');
      console.log('Transaction Result:', result);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  // Fetch Random Number from contract (for example)
  const fetchRandomNumber = async () => {
    try {
      const result = await universalUi.request(
        {
          method: 'eth_call',
          params: [
            {
              to: contractAddress,
              data: '0x0c949043', // Example method signature for fetching data
            },
          ],
        },
        'eip155:545'
      );
      console.log(ethers.BigNumber.from(result).toNumber());
    } catch (error) {
      console.error('Error fetching random number:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Poker Game</h1>
      <p>Connect your OKX Wallet to play.</p>

      {!connected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected as: {walletAddress}</p>
          <button onClick={playGame}>Play Game</button>
          <button onClick={fetchRandomNumber}>RNG</button>
        </div>
      )}

      <div>
        <label htmlFor="gameId">Game ID:</label>
        <input
          type="number"
          id="gameId"
          value={gameId}
          onChange={(e) => setGameId(Number(e.target.value))}
          min="1"
        />
      </div>
    </div>
  );
}

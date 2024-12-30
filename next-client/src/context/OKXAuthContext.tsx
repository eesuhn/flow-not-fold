'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OKXUniversalConnectUI, THEME } from '@okxconnect/ui';

interface OKXAuthContextType {
  connected: boolean;
  walletAddress: string | null;
  chainId: string | null;
  logIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<OKXAuthContextType | undefined>(undefined);

export const OKXAuthContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [client, setClient] = useState<OKXUniversalConnectUI | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const initClient = async () => {
      try {
        const uiClient = await OKXUniversalConnectUI.init({
          dappMetaData: {
            name: 'Flow not Fold!',
            icon: 'https://cryptologos.cc/logos/flow-flow-logo.png',
          },
          actionsConfiguration: {
            returnStrategy: 'none', // Or 'tg://resolve'
            modals: 'all',
          },
          uiPreferences: {
            theme: THEME.LIGHT,
          },
        });
        setClient(uiClient);
      } catch (error) {
        console.error('Failed to initialize OKX UI:', error);
      }
    };
    initClient();
  }, []);

  const logIn = async () => {
    if (!client) return;
    try {
      const session = await client.openModal({
        namespaces: {
          eip155: {
            chains: ['eip155:545'],
            defaultChain: '545',
          },
        },
      });

      // Ensure session is defined
      if (!session || !session.namespaces.eip155) {
        console.error('Session is undefined or invalid');
        return;
      }

      const address = session.namespaces.eip155.accounts[0]?.split(':')[2];

      // Remove the "eip155:" prefix from the chainId
      const rawChainId = session.namespaces.eip155.chains[0];
      const chain = rawChainId?.split(':')[1] || null;

      setWalletAddress(address);
      setChainId(chain);
      setConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const logOut = async () => {
    if (!client) return;
    try {
      await client.disconnect();
      setWalletAddress(null);
      setChainId(null);
      setConnected(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        connected,
        walletAddress,
        chainId,
        logIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useOKXAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

type AuthContextType = {
  userID: number | null;
  username: string | null;
  windowHeight: number;
  isDataValid: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const validateInitData = async (
  initData: string,
  botToken: string
): Promise<boolean> => {
  try {
    // Parse the init data
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;
    urlParams.delete('hash');

    // Sort parameters alphabetically
    const params = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Convert strings to Uint8Array
    const encoder = new TextEncoder();
    const botTokenData = encoder.encode(botToken);
    const paramsData = encoder.encode(params);
    const webAppData = encoder.encode('WebAppData');

    // Create secret key using Web Crypto API
    const secretKeyHmac = await crypto.subtle.importKey(
      'raw',
      webAppData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const secretKey = await crypto.subtle.sign(
      'HMAC',
      secretKeyHmac,
      botTokenData
    );

    // Calculate hash using Web Crypto API
    const finalHmac = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', finalHmac, paramsData);

    // Convert to hex
    const calculatedHash = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('Calculated hash:', calculatedHash);
    console.log('Received hash:', hash);

    return hash === calculatedHash;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
};

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [windowHeight, setWindowHeight] = useState<number>(0);
  const [userID, setUserID] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isDataValid, setIsDataValid] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && WebApp) {
      WebApp.isVerticalSwipesEnabled = false;
      setWindowHeight(WebApp.viewportStableHeight || window.innerHeight);
      WebApp.ready();

      (async () => {
        try {
          // Important: Use the bot token, not the bot ID
          const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN || '';
          console.log('Init Data:', WebApp.initData);

          const isValid = await validateInitData(WebApp.initData, botToken);
          console.log('Validation result:', isValid);

          setIsDataValid(isValid);

          if (isValid) {
            const user = WebApp.initDataUnsafe.user;
            setUserID(user?.id || null);
            setUsername(user?.username || null);
          }
        } catch (error) {
          console.error('Validation failed:', error);
          setIsDataValid(false);
        }
      })();
    }
  }, []);

  const contextValue = {
    userID,
    username,
    windowHeight,
    isDataValid,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};

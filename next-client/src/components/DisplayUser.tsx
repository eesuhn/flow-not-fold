'use client';

import { useUserAuth } from '@/context/UserAuthContext';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function DisplayUser() {
  const { userID, username, windowHeight, isDataValid } = useUserAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function updateUser() {
      if (!userID || !username) {
        console.log('Missing userID or username:', { userID, username });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        console.log('Attempting to upsert:', {
          user_id: Number(userID),
          username,
        });

        const { data, error } = await supabase.from('User').upsert(
          {
            user_id: Number(userID),
            username,
          },
          { onConflict: 'user_id' }
        );

        if (error) {
          console.error('Detailed error:', error);
          setError(`Failed to update user data: ${error.message}`);
          setIsSuccess(false);
        } else {
          if (data) {
            console.log('Update successful:', data);
            setIsSuccess(true);
          } else {
            console.error('User already exists:', data);
            setError('User already exists');
          }
        }
      } catch (err) {
        console.error('Caught error:', err);
        setError(
          `Unexpected error: ${err instanceof Error ? err.message : String(err)}`
        );
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    }

    updateUser();
  }, [userID, username]);

  if (!isDataValid) {
    // Display a message if validation failed
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold text-red-600">Validation Failed</h1>
        <p className="text-lg">
          The data could not be validated. Please try reloading the app.
        </p>
      </div>
    );
  }

  // Display user data if validation succeeded
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 text-center">
      {isLoading && <p className="text-blue-500">Updating user data...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {isSuccess && (
        <p className="text-green-500">User data updated successfully!</p>
      )}
      <h1 className="text-4xl font-bold">Welcome to the Telegram Web App!</h1>
      <p>User ID: {userID || 'Not available'}</p>
      <p>Username: {username || 'Not available'}</p>
      <p>Window Height: {windowHeight}</p>
    </div>
  );
}

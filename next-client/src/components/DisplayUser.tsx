'use client';

import { useAuth } from '@/context/AuthContext';

export default function DisplayUser() {
  const { userID, username, windowHeight, isDataValid } = useAuth();

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
      <h1 className="text-4xl font-bold">Welcome to the Telegram Web App!</h1>
      <p>User ID: {userID || 'Not available'}</p>
      <p>Username: {username || 'Not available'}</p>
      <p>Window Height: {windowHeight}</p>
    </div>
  );
}

// Stores logged-in user data (Supabase Auth).

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signOut, signUp, onAuthChange, getCurrentUser } from '../api/auth';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    (async () => {
      try {
        const u = await getCurrentUser();
        setUser(u ?? null);
      } finally {
        setLoading(false);
      }
      unsubscribe = onAuthChange(setUser);
    })();
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut: async () => {
      await signOut();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

 function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within <AuthProvider>');
  return ctx;
}

export { useAuthContext, AuthProvider }
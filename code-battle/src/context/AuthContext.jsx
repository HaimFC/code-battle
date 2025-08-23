// context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { signIn, signOut as supaSignOut, signUp, onAuthChange, getCurrentUser } from "../api/auth";

const AuthContext = createContext(null);

function AuthProvider({ children, onAuthReady }) {
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
        onAuthReady?.();
      }
      unsubscribe = onAuthChange(setUser);
    })();
    return () => unsubscribe();
  }, [onAuthReady]);

  const value = {
    user,
    loading,
    signIn,
    signUp, // <— the new extended signUp({ ... })
    signOut: async () => {
      await supaSignOut();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within <AuthProvider>");
  return ctx;
}

export { useAuthContext, AuthProvider };

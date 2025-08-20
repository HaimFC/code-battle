import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

const AuthContext = createContext(null);

export function AuthProvider({ onAuthReady, children }) {
  const [activeUser, setActiveUser] = useState(null);
  const navigate = useNavigate();

  // Call onAuthReady after mount
  useEffect(() => {
    onAuthReady();
  }, [onAuthReady]);

  const handleLogin = async (email, password) => {
    setActiveUser({ id: 1, displayName: "john" });
    navigate("/");
  };

  const handleLogout = async () => {
    setActiveUser(null);
    navigate("/");
  };

  return (
    <AuthContext value={{ activeUser, handleLogin, handleLogout }}>
      {children}
    </AuthContext>
  );
}

export const useMockAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

const AuthContext = createContext(null);

export function AuthProvider({ onAuthReady, children }) {
  const [activeUser, setActiveUser] = useState(
    JSON.parse(localStorage.getItem("activeUser")) || null
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      if (!activeUser) {
        handleLogin();
      }
      onAuthReady();
    };
    fetchSession();
  }, []);

  const handleLogin = async (email, password) => {
    const mockUser = { id: 1, displayName: "john", score: 0 };
    localStorage.setItem("activeUser", JSON.stringify(mockUser));
    setActiveUser(mockUser);
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

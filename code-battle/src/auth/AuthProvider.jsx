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
    navigate("/code-battle/code-battle/");
  };

  const handleLogout = async () => {
    setActiveUser(null);
    navigate("/code-battle/code-battle/");
  };

  const handleSignUp = async (email, password) => {
    const isAlreadySignedUp = false;
    if (isAlreadySignedUp) {
      console.log("user already is signed up. logging in");
      return await handleLogin(email, password);
    }

    const signUp = true;
    if (!signUp) {
      throw new Error("Cannot sign up user. fix this");
    }
    return await handleLogin(email, password);
  };

  return (
    <AuthContext
      value={{ activeUser, handleLogin, handleLogout, handleSignUp }}
    >
      {children}
    </AuthContext>
  );
}

export const useMockAuth = () => useContext(AuthContext);

// holds React Router setup and wraps everything with Context Providers (Auth, Battle).
import "./App.css";
import { Route, Routes, useNavigate } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import HelpPage from "./pages/HelpPage";
import Layout from "./components/Layout";
import { useState } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import SelectPage from "./pages/SelectPage";
import ProtectedRoute from "./auth/ProtectedRoute";

const links = {
  guest: [
    { to: "/", text: "Home" },
    { to: "/login", text: "Log in" },
    { to: "/signup", text: "Sign Up" },
    { to: "/leaderboard", text: "Leaderboard" },
    { to: "/help", text: "Help" },
  ],
  user: [
    { to: "/", text: "Home" },
    { to: "/leaderboard", text: "Leaderboard" },
    { to: "/help", text: "Help" },
    { to: "/practice-select", text: "Practice" },
  ],
};

function App() {
  const navigate = useNavigate();

  const [isAuthReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState("Practice");
  const [difficulty, setDifficulty] = useState("Easy");
  const [start, setStart] = useState(false);

  function handleSelectMode(mode) {
    if (mode === "Practice Mode") {
      setMode("Practice Mode");
      navigate("/practice-select");
    } else if (text === "Battle Mode") {
      // setMode("Battle Mode");
      // navigate("battle-select");
    } else {
      console.log("error: returning home");
      navigate("/");
    }
  }

  function handleStartCoding() {
    setStart(true);
    // navigate("/code-battle");
  }

  // function handleFinishCoding() {
  //   setStart(false);
  // }

  return (
    <>
      <AuthProvider onAuthReady={() => setAuthReady(true)}>
        {isAuthReady && (
          <Layout links={links}>
            <Routes>
              {/* Guest Routes */}
              <Route
                path="/"
                element={<HomePage handleSelectMode={handleSelectMode} />}
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/help" element={<HelpPage />} />
              {/* User Routes */}
              <Route
                path="/practice-select"
                element={
                  <ProtectedRoute>
                    <SelectPage
                      setDifficulty={setDifficulty}
                      handleStartCoding={handleStartCoding}
                    />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        )}
      </AuthProvider>
    </>
  );
}

export default App;

// holds React Router setup and wraps everything with Context Providers (Auth, Battle).
import "./App.css";
import { Route, Routes, useNavigate, Navigate } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import HelpPage from "./pages/HelpPage";
import Layout from "./components/Layout";
import { useState } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import ProfilePage from "./pages/ProfilePage";
import SelectPage from "./pages/SelectPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import WaitingRoomPage from "./pages/WaitingRoomPage";
import CodeBattlePage from "./pages/CodeBattlePage";
import {
  postMockBattle,
  joinMockBattle,
  forfeitMockBattle,
} from "./utils/supabaseQueries";

function App() {
  const navigate = useNavigate();
  const [isAuthReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState("Practice");
  const [difficulty, setDifficulty] = useState("Easy");
  const [opponent, setOpponent] = useState(null);
  const [battleID, setBattleID] = useState(null);

  function handleSelectMode() {
    if (mode === "Practice") {
      navigate("/select-difficulty");
    } else if (mode === "Battle") {
      navigate("/select-difficulty");
    } else {
      navigate("/");
    }
  }

  async function handleStartCoding(activeUser) {
    if (mode === "Practice") {
      navigate("/code-battle");
    } else if (mode === "Battle") {
      const joinedBattle = await joinMockBattle(difficulty);
      if (!joinedBattle) {
        const battle = await postMockBattle(activeUser, difficulty);
        setBattleID(battle);
        navigate("/waiting-room");
        return;
      }
      navigate("/code-battle");
    }
  }

  function handleFinishCoding() {
    navigate("/summary");
  }

  async function handleOpponentFound(foundOpponent) {
    setOpponent(foundOpponent);
    navigate("/code-battle");
  }

  async function handleForfeitBattle(activeUser, battleID) {
    if (!battleID) {
      navigate("/");
      return;
    }

    const success = await forfeitMockBattle(activeUser, battleID);
    if (!success) {
      throw new Error("user quit, but db thinks he is still available");
    }
    console.log("successfully forfeit the match");
    setBattleID(null);
    navigate("/");
  }

  return (
    <>
      <AuthProvider onAuthReady={() => setAuthReady(true)}>
        {isAuthReady && (
          <Layout>
            <Routes>
              {/* Guest Routes */}
              <Route
                path="/"
                element={
                  <HomePage
                    handleSelectMode={handleSelectMode}
                    setMode={setMode}
                    mode={mode}
                  />
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/help" element={<HelpPage />} />
              {/* User Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/select-difficulty"
                element={
                  <ProtectedRoute>
                    <SelectPage
                      mode={mode}
                      setDifficulty={setDifficulty}
                      difficulty={difficulty}
                      handleStartCoding={handleStartCoding}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/waiting-room"
                element={
                  <ProtectedRoute>
                    battleID ? (
                    <WaitingRoomPage
                      onOpponentFound={handleOpponentFound}
                      difficulty={difficulty}
                    />
                    ) : <Navigate replace to={"/"} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/code-battle"
                element={
                  <ProtectedRoute>
                    <CodeBattlePage
                      mode={mode}
                      battleID={battleID}
                      handleFinishCoding={handleFinishCoding}
                      handleForfeitBattle={handleForfeitBattle}
                    />
                  </ProtectedRoute>
                }
              />
              <Route path="/*" element={<Navigate replace to="/" />} />
            </Routes>
          </Layout>
        )}
      </AuthProvider>
    </>
  );
}

export default App;

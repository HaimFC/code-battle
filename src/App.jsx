import "./App.css";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import HelpPage from "./pages/HelpPage";
import Layout from "./components/Layout";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./auth/ProtectedRoute";

import PracticePickPage from "./pages/PracticePickPage";
import LoadingPracticeQuestion from "./pages/LoadingPracticeQuestion";

import BattleListPage from "./pages/BattleListPage";
import WaitingRoomPage from "./pages/WaitingRoomPage";
import BattlePage from "./pages/BattlePage";
import EndPracticePage from "./pages/EndPracticePage";
import EndBattlePage from "./pages/EndBattlePage";

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
    if (battleID) {
      navigate(`/code-battle/battle/${battleID}`);
      return;
    }
    if (mode === "Practice") {
      navigate("/code-battle/code-battle/practice");
    } else if (mode === "Battle") {
      navigate("/code-battle/code-battle/battle");
    } else {
      navigate("/code-battle/code-battle/");
    }
  }

  async function handleStartCoding(activeUser) {
    if (mode === "Practice") {
      navigate("/code-battle/code-battle/practice");
    } else if (mode === "Battle") {
      const joinedBattle = await joinMockBattle(difficulty);
      if (!joinedBattle) {
        const battle = await postMockBattle(activeUser, difficulty);
        setBattleID(battle);
        navigate("/code-battle/code-battle/battle/waiting-room");
        return;
      }
      navigate(`/code-battle/battle/${joinedBattle}`);
    }
  }

  function handleFinishCoding() {
    navigate("/code-battle/code-battle/summary");
  }

  async function handleOpponentFound(foundOpponent) {
    setOpponent(foundOpponent);
    navigate("/code-battle/code-battle/battle");
  }

  async function handleForfeitBattle(activeUser, battleID) {
    if (!battleID) {
      navigate("/code-battle/code-battle/");
      return;
    }
    const success = await forfeitMockBattle(activeUser, battleID);
    if (!success) {
      throw new Error("user quit, but db thinks he is still available");
    }
    setBattleID(null);
    navigate("/code-battle/code-battle/");
  }

  return (
    <>
      <AuthProvider onAuthReady={() => setAuthReady(true)}>
        {isAuthReady && (
          <Layout>
            <Routes>
              <Route
                path="/code-battle/"
                element={
                  <HomePage
                    handleSelectMode={handleSelectMode}
                    setMode={setMode}
                    mode={mode}
                    battleID={battleID}
                  />
                }
              />
              <Route path="/code-battle/login" element={<LoginPage />} />
              <Route path="/code-battle/signup" element={<SignUpPage />} />
              <Route
                path="/code-battle/leaderboard"
                element={<LeaderboardPage />}
              />
              <Route path="/code-battle/help" element={<HelpPage />} />

              <Route
                path="/code-battle/practice"
                element={
                  <ProtectedRoute>
                    <PracticePickPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/code-battle/practice/:difficulty"
                element={
                  <ProtectedRoute>
                    <LoadingPracticeQuestion />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/code-battle/battle"
                element={
                  <ProtectedRoute>
                    <BattleListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/code-battle/battle/waiting-room"
                element={
                  <ProtectedRoute>
                    <WaitingRoomPage
                      onOpponentFound={handleOpponentFound}
                      difficulty={difficulty}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/code-battle/battle/:battleId"
                element={
                  <ProtectedRoute>
                    <BattlePage comp />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/code-battle/end-practice"
                element={
                  <ProtectedRoute>
                    <EndPracticePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/code-battle/end-battle"
                element={
                  <ProtectedRoute>
                    <EndBattlePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/code-battle/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/code-battle/*"
                element={<Navigate replace to="/" />}
              />
            </Routes>
          </Layout>
        )}
      </AuthProvider>
    </>
  );
}
export default App;

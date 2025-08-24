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
      navigate(`/battle/${battleID}`);
      return;
    }
    if (mode === "Practice") {
      navigate("/practice");
    } else if (mode === "Battle") {
      navigate("/battle");
    } else {
      navigate("/");
    }
  }

  async function handleStartCoding(activeUser) {
    if (mode === "Practice") {
      navigate("/practice");
    } else if (mode === "Battle") {
      const joinedBattle = await joinMockBattle(difficulty);
      if (!joinedBattle) {
        const battle = await postMockBattle(activeUser, difficulty);
        setBattleID(battle);
        navigate("/battle/waiting-room");
        return;
      }
      navigate(`/battle/${joinedBattle}`);
    }
  }

  function handleFinishCoding() {
    navigate("/summary");
  }

  async function handleOpponentFound(foundOpponent) {
    setOpponent(foundOpponent);
    navigate("/battle");
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
    setBattleID(null);
    navigate("/");
  }

  return (
    <>
      <AuthProvider onAuthReady={() => setAuthReady(true)}>
        {isAuthReady && (
          <Layout>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    handleSelectMode={handleSelectMode}
                    setMode={setMode}
                    mode={mode}
                    battleID={battleID}
                  />
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/help" element={<HelpPage />} />

              <Route
                path="/practice"
                element={
                  <ProtectedRoute>
                    <PracticePickPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practice/:difficulty"
                element={
                  <ProtectedRoute>
                    <LoadingPracticeQuestion />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/battle"
                element={
                  <ProtectedRoute>
                    <BattleListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/battle/waiting-room"
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
                path="/battle/:battleId"
                element={
                  <ProtectedRoute>
                    <BattlePage comp />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/end-practice"
                element={
                  <ProtectedRoute>
                    <EndPracticePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/end-battle"
                element={
                  <ProtectedRoute>
                    <EndBattlePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
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

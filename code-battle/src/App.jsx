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
import LoadingBattleQuestion from "./pages/LoadingBattleQuestion";

function App() {
  const navigate = useNavigate();
  const [isAuthReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState("Practice");
  const [difficulty, setDifficulty] = useState("Easy");

  function handleSelectMode() {
    if (mode === "Practice") {
      navigate("/practice");
    } else if (mode === "Battle") {
      navigate("/battle");
    } else {
      navigate("/");
    }
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
                path="/battle/:battleId"
                element={
                  <ProtectedRoute>
                    <LoadingBattleQuestion />
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

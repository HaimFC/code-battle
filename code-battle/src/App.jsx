// holds React Router setup and wraps everything with Context Providers (Auth, Battle).
import "./App.css";
import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import HelpPage from "./pages/HelpPage";
import Layout from "./components/Layout";
import { useState } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import PracticeSelectPage from "./pages/PracticeSelectPage";
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
  const [isAuthReady, setAuthReady] = useState(false);

  return (
    <>
      <AuthProvider onAuthReady={() => setAuthReady(true)}>
        {isAuthReady && (
          <Layout links={links}>
            <Routes>
              {/* Guest Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/help" element={<HelpPage />} />
              {/* User Routes */}
              <Route
                path="/practice-select"
                element={
                  <ProtectedRoute>
                    <PracticeSelectPage />
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

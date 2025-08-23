// holds React Router setup and wraps everything with Context Providers (Auth, Battle).

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
import { AuthProvider } from "./context/AuthContext";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./auth/ProtectedRoute";

// Practice flow
import PracticePickPage from "./pages/PracticePickPage";
import LoadingPracticeQuestion from "./pages/LoadingPracticeQuestion";

// Battle flow
import BattleListPage from "./pages/BattleListPage"; // <-- NEW
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
    if (battleID) {
      navigate("/code-battle");
      return;
    }
    if (mode === "Practice") {
      navigate("/practice"); // → Practice picker
    } else if (mode === "Battle") {
      navigate("/battle");   // → BattleListPage (new)
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
    setBattleID(null);
    navigate("/");
  }

  return (
    <>
      <AuthProvider onAuthReady={() => setAuthReady(true)}>
        {isAuthReady && (
          <Layout>
            <Routes>
              {/* Public */}
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

              {/* Practice */}
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

              {/* Battle */}
              <Route
                path="/battle"
                element={
                  <ProtectedRoute>
                    <BattleListPage />
                  </ProtectedRoute>
                }
              />
              {battleID && (
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
              )}
              <Route
                path="/code-battle"
                element={
                  <ProtectedRoute>
                    <CodeBattlePage
                      mode="Battle"
                      battleID={battleID}
                      handleFinishCoding={handleFinishCoding}
                      handleForfeitBattle={handleForfeitBattle}
                    />
                  </ProtectedRoute>
                }
              />

              {/* Profile */}
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


// import BattlePage from './pages/BattlePage';
// import BattleListPage from './pages/BattleListPage';
// import PracticeModeCard from './components/PracticeModeCard';
// import PracticePickPage from './pages/PracticePickPage';

// const comp = true
// const players = [{name:"Haim Cohen", status:"Coding..."},{name:"Shlomo Levi", status:"Coding..."}]
// const question = {description: `/*
// Create a function that takes two numbers and a mathematical operator + - / * and will perform a calculation with the given numbers.

// Examples
// calculator(2, "+", 2) âžž 4

// calculator(2, "*", 2) âžž 4

// calculator(4, "/", 2) âžž 2
// Notes
// If the input tries to divide by 0, return: "Can't divide by 0!"
// */
// `, initialValue:`function calculator( /*args*/ ) {
//   //your code
// }

// exports.solution = calculator;`}

// function App() {
//   const modes = ["easy", "medium", "hard", "hell"];

//   return (
//     <>
//     <div>
//       {/* <BattlePage comp={comp} players={players} question={question}/> */}
//       {/* <BattleListPage/> */}
//       {/* <PracticePickPage/> */}
//     </div>
        
//   </>
//   )}

// export default App

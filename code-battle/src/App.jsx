// holds React Router setup and wraps everything with Context Providers (Auth, Battle).
import "./App.css";

import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";
import Layout from "./components/Layout";

const links = {
  guest: [
    { to: "/", text: "Home" },
    { to: "/login", text: "Log in" },
    { to: "/signup", text: "Sign Up" },
  ],
  user: [],
};

function App() {
  return (
    <>
      <Layout links={links}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;

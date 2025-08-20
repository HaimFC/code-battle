// holds React Router setup and wraps everything with Context Providers (Auth, Battle).
import "./App.css";

import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </>
  );
}

export default App;

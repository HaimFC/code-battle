import { useState } from "react";
import { Button } from "@mantine/core";
import { useNavigate } from "react-router";
import PracticeModeCard from "../components/PracticeModeCard";
import "../styles/PracticePickPage.css";

const modes = ["easy", "medium", "hard", "hell"];

function PracticePickPage() {
  const navigate = useNavigate();

  function handleEnter(mode) {
    navigate(`/practice/${mode}`);
  }

  function backToHome() {
    navigate("/");
  }

  return (
    <div className="practice-list-page">
      <Button bottom={"35px"} left={"25px"} w={100} onClick={backToHome}>
        Back
      </Button>
      <h1 className="practice-title">Practice</h1>
      <div className="practice-cards">
        {modes.map((mode) => (
          <PracticeModeCard
            key={mode}
            img={`/images/${mode}.png`}
            diff={mode}
            onClick={() => handleEnter(mode)}
          />
        ))}
      </div>
    </div>
  );
}

export default PracticePickPage;

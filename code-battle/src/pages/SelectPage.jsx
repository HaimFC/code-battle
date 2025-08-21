import { useMockAuth } from "../auth/AuthProvider";
import Cards from "../components/Cards";

// Shows list of coding questions.
export default function SelectPage({ mode, setDifficulty, handleStartCoding }) {
  const { activeUser } = useMockAuth();
  const cards = [{ text: "Easy" }, { text: "Medium" }, { text: "Hard" }];

  return (
    <>
      <p>{mode} Mode</p>
      <p>Select Difficulty</p>
      <Cards cards={cards} handleClick={setDifficulty} />
      <button onClick={() => handleStartCoding(activeUser)}>{mode}</button>
    </>
  );
}

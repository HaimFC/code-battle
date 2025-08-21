// Landing page, intro, and navigation.
import { useMockAuth } from "../auth/AuthProvider";
import Cards from "../components/Cards";

export default function HomePage({
  handleSelectMode,
  setMode,
  mode,
  difficulty,
}) {
  const { activeUser } = useMockAuth();

  if (activeUser) {
    const cards = [{ text: "Practice" }, { text: "Battle" }];
    return (
      <>
        <Cards cards={cards} handleClick={setMode} />
        <button onClick={handleSelectMode}>Submit</button>
        <p>Mode: {mode}</p>
        <p>Difficulty: {difficulty}</p>
      </>
    );
  }

  return <p>Welcome to the Code Battle App</p>;
}

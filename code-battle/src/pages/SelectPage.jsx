import Cards from "../components/Cards";

// Shows list of coding questions.
export default function SelectPage({ setDifficulty, handleStartCoding }) {
  const cards = [{ text: "Easy" }, { text: "Medium" }, { text: "Hard" }];

  return (
    <>
      <Cards cards={cards} handleClick={setDifficulty} />
      <button onClick={handleStartCoding}>Practice</button>
    </>
  );
}

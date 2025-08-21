// Landing page, intro, and navigation.
import { useMockAuth } from "../auth/AuthProvider";
import Cards from "../components/Cards";
import { Button } from "@mantine/core";

export default function HomePage({
  handleSelectMode,
  setMode,
  mode,
  battleID,
}) {
  const { activeUser } = useMockAuth();
  if (activeUser && battleID) {
    const cards = [{ text: "Return to Battle!" }];
    return (
      <>
        <Cards cards={cards} handleClick={setMode} selected={mode} />
        <Button onClick={handleSelectMode}>Submit</Button>
      </>
    );
  }
  if (activeUser) {
    const cards = [{ text: "Practice" }, { text: "Battle" }];
    return (
      <>
        <Cards cards={cards} handleClick={setMode} selected={mode} />
        <Button onClick={handleSelectMode}>Submit</Button>
      </>
    );
  }

  return <p>Welcome to the Code Battle App</p>;
}

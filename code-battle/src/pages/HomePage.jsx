// Landing page, intro, and navigation.
import { useMockAuth } from "../auth/AuthProvider";
import Cards from "../components/Cards";

export default function HomePage({ handleSelectMode }) {
  const { activeUser } = useMockAuth();

  if (activeUser) {
    const cards = [{ text: "Practice Mode" }, { text: "Battle Mode" }];
    return (
      <>
        <Cards cards={cards} handleClick={handleSelectMode} />
      </>
    );
  }

  return <p>Welcome to the Code Battle App</p>;
}

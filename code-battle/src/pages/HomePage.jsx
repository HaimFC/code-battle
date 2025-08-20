// Landing page, intro, and navigation.
import { useMockAuth } from "../auth/AuthProvider";
import Cards from "../components/Cards";

export default function HomePage() {
  const { activeUser } = useMockAuth();

  if (activeUser) {
    const cards = [
      { text: "Practice Mode", to: "/practice-select" },
      { text: "Battle Mode", to: "battle-select" },
    ];
    return (
      <>
        <Cards cards={cards} />
      </>
    );
  }

  return <p>Welcome to the Code Battle App</p>;
}

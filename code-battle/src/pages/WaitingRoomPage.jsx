import { useEffect } from "react";
import { getMockOpponent } from "../utils/supabaseQueries";

// waiting for opponent
export default function WaitingRoomPage({ onOpponentFound, difficulty }) {
  useEffect(() => {
    const interval = setInterval(() => {
      async function getData() {
        const opponent = await getMockOpponent(difficulty);
        if (opponent && opponent.displayName) {
          onOpponentFound(opponent);
        }
      }
      getData();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <>Waiting for Opponent</>;
}

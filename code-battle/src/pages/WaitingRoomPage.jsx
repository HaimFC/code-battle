import { useEffect } from "react";
import { useNavigate } from "react-router";
import { getOpponent } from "../utils/supabaseQueries";

// waiting for opponent
export default function WaitingRoomPage({ onOpponentFound, mode, difficulty }) {
  useEffect(() => {
    const interval = setInterval(() => {
      async function getData() {
        const opponent = await getOpponent(difficulty);
        if (opponent && opponent.displayName) {
          onOpponentFound(opponent);
        }
      }
      getData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <>Waiting for Opponent</>;
}

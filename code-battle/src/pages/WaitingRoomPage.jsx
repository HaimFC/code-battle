import { getMockOpponent } from "../utils/supabaseQueries";
import { useInterval } from "../hooks/useInterval";

// waiting for opponent
export default function WaitingRoomPage({ onOpponentFound, difficulty }) {
  useInterval(() => {
    async function getData() {
      const opponent = await getMockOpponent(difficulty);
      if (opponent && opponent.displayName) {
        onOpponentFound(opponent);
      }
    }
    getData();
  });

  return <>Waiting for Opponent</>;
}

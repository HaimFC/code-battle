// Shows leaderboard table.
import { useEffect, useState } from "react";
import { getMockLeaderboard } from "../utils/supabaseQueries";
import LeaderboardEntry from "../components/LeaderboardEntry";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function getData() {
      const leaderboard = await getMockLeaderboard();
      setLeaderboard(leaderboard);
    }
    getData();
  }, []);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Rating</th>
            <th>Rank</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard &&
            leaderboard.map(({ displayName, elo }, index) => (
              <LeaderboardEntry
                key={index}
                displayName={displayName}
                elo={elo}
                rank={index}
              />
            ))}
        </tbody>
      </table>
    </>
  );
}

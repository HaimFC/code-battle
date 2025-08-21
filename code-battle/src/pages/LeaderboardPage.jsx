// Shows leaderboard table.
import { useEffect, useState } from "react";
import { getMockLeaderboard } from "../utils/supabaseQueries";
import LeaderboardEntry from "../components/LeaderboardEntry";
import { Table } from "@mantine/core";

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
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Rating</Table.Th>
          <Table.Th>Rank</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {leaderboard &&
          leaderboard.map(({ displayName, score }, index) => (
            <LeaderboardEntry
              key={index}
              displayName={displayName}
              score={score}
              rank={index}
            />
          ))}
      </Table.Tbody>
    </Table>
  );
}

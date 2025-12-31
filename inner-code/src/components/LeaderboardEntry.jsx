import { Table } from "@mantine/core";

export default function LeaderboardEntry({ displayName, score, rank }) {
  return (
    <Table.Tr>
      <Table.Td>{displayName}</Table.Td>
      <Table.Td>{score}</Table.Td>
      <Table.Td>{rank + 1}</Table.Td>
    </Table.Tr>
  );
}

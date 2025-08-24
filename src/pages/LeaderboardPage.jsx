// Shows leaderboard table (profiles sorted by rank desc, then score desc)
import { useEffect, useState } from "react";
import { getLeaderboardProfiles } from "../utils/supabaseQueries";
import {
  Card,
  Table,
  Avatar,
  Group,
  Text,
  Badge,
  Skeleton,
  Stack,
} from "@mantine/core";

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getLeaderboardProfiles();
        setRows(data);
      } catch (e) {
        console.error("Failed to load leaderboard:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card radius="lg" withBorder p="lg" style={{ maxWidth: 900, margin: "0 auto" }}>
      <Text fw={700} mb="sm" size="lg">
        Leaderboard
      </Text>

      {loading ? (
        <Stack>
          <Skeleton height={32} />
          <Skeleton height={32} />
          <Skeleton height={32} />
        </Stack>
      ) : (
        <Table
          highlightOnHover
          striped
          withTableBorder
          withColumnBorders
          stickyHeader
          horizontalSpacing="md"
          verticalSpacing="sm"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th width={60}>#</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th width={120}>Rank</Table.Th>
              <Table.Th width={120}>Score</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((p, idx) => (
              <Table.Tr key={p.id}>
                <Table.Td>
                  <Text fw={600}>{idx + 1}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar name={p.name} radius="xl" />
                    <div>
                      <Text fw={600}>{p.name}</Text>
                      {/* Optional small detail line */}
                      {/* <Text size="xs" c="dimmed">{p.display_name ? 'Nickname' : '—'}</Text> */}
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={p.rank === 5 ? "violet" : p.rank >= 3 ? "blue" : "gray"}
                    variant="light"
                  >
                    Rank {p.rank}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text fw={600}>{p.score}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Card>
  );
}

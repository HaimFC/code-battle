// Instructions / rules page (Mantine elegant layout)
import {
  Card,
  Stack,
  Title,
  Text,
  Divider,
  List,
  ThemeIcon,
  Group,
  Badge,
  Alert,
} from "@mantine/core";
import { IconSword, IconClock, IconFlag, IconCheck } from "@tabler/icons-react";

export default function HelpPage() {
  return (
    <Card radius="lg" withBorder p="lg" style={{ maxWidth: 860, margin: "0 auto" }}>
      <Stack gap="md">
        {/* Intro */}
        <Title order={2}>How Code Battle Works</Title>
        <Text c="dimmed">
          Compete against another player. Score is based on correctness, time to complete,
          and time/space complexity.
        </Text>

        <Divider />

        {/* Quick steps */}
        <Title order={4}>Quick Start</Title>
        <List
          spacing="xs"
          icon={
            <ThemeIcon color="blue" size={20} radius="xl">
              <IconCheck size={14} />
            </ThemeIcon>
          }
        >
          <List.Item>Step 1: Sign up / Log in</List.Item>
          <List.Item>Step 2: Choose a mode: Practice / Battle</List.Item>
          <List.Item>Step 3: Choose a difficulty: Easy, Medium, Hard</List.Item>
          <List.Item>Step 4: Code!</List.Item>
        </List>

        <Divider />

        {/* Battle mode */}
        <Group align="center" gap="xs">
          <ThemeIcon color="violet" radius="xl" size={28}>
            <IconSword size={16} />
          </ThemeIcon>
          <Title order={4} style={{ marginBottom: 0 }}>
            Battle Mode
          </Title>
        </Group>

        <List
          spacing="sm"
          icon={
            <ThemeIcon color="violet" size={20} radius="xl">
              <IconSword size={14} />
            </ThemeIcon>
          }
        >
          <List.Item>
            Both players solve the <b>same challenge</b> head-to-head.
          </List.Item>
          <List.Item>
            A <b>timer at the top</b> shows how long has elapsed since the battle began.
          </List.Item>
          <List.Item>
            Each player has a status: <Badge color="blue" radius="sm" variant="light">coding</Badge>{" "}
            or <Badge color="grape" radius="sm" variant="light">finished</Badge>.
          </List.Item>
          <List.Item>
            When <b>any player switches to “finished”</b>, the timer turns <b style={{ color: "var(--mantine-color-red-6)" }}>red</b> and
            starts a <b>2-minute countdown</b>. This prevents the finished player from waiting too long and gives the other player time for final touches.
          </List.Item>
        </List>

        <Alert color="red" variant="light" title="Important rule">
          Battles <b>cannot be finished in the first 3 minutes</b>. After the 3-minute mark, finishing will
          trigger the red 2-minute countdown described above.
        </Alert>

        <Divider />

        {/* Small legend */}
        <Group gap="sm">
          <Text fw={600}>Status legend:</Text>
          <Badge color="blue" variant="light">coding</Badge>
          <Badge color="grape" variant="light">finished</Badge>
          <Group gap={6} align="center">
            <ThemeIcon color="red" size={22} radius="xl">
              <IconClock size={14} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">
              Red timer = 2-minute countdown
            </Text>
          </Group>
          <Group gap={6} align="center">
            <ThemeIcon color="gray" size={22} radius="xl">
              <IconFlag size={14} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">
              Earliest finish allowed: 3:00
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}

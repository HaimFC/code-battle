// Landing page, intro, and navigation (Mantine styled)
import { useAuthContext } from "../context/AuthContext";
import Cards from "../components/Cards";
import {
  Button,
  Card,
  Container,
  Stack,
  Title,
  Text,
  Group,
  Divider,
  Badge,
} from "@mantine/core";
import { Link } from "react-router";

export default function HomePage({ handleSelectMode, setMode, mode, battleID }) {
  const { user } = useAuthContext();

  // Logged-in + has ongoing battle
  if (user && battleID) {
    const cards = [{ text: "Return to Battle!" }];
    return (
      <Container size="md" py="lg">
        <Card radius="lg" withBorder p="lg">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={3} style={{ margin: 0 }}>
                Welcome back!
              </Title>
              <Badge color="violet" variant="light">
                Active battle
              </Badge>
            </Group>

            <Text c="dimmed">
              You have an active battle in progress. Jump back in to continue.
            </Text>

            <Divider />

            <Cards cards={cards} handleClick={setMode} selected={mode} />

            <Group justify="flex-end">
              <Button size="md" onClick={handleSelectMode}>
                Return to Battle
              </Button>
            </Group>
          </Stack>
        </Card>
      </Container>
    );
  }

  // Logged-in (no ongoing battle): choose mode
  if (user) {
    const cards = [{ text: "Practice" }, { text: "Battle" }];
    return (
      <Container size="md" py="lg">
        <Card radius="lg" withBorder p="lg">
          <Stack gap="md">
            <Title order={3} style={{ margin: 0 }}>
              Choose your mode
            </Title>
            <Text c="dimmed">
              Practice freely or battle another player on the same challenge.
            </Text>

            <Divider />

            <Cards cards={cards} handleClick={setMode} selected={mode} />

            <Group justify="flex-end">
              <Button size="md" onClick={handleSelectMode}>
                Submit
              </Button>
            </Group>
          </Stack>
        </Card>
      </Container>
    );
  }

  // Guest (not logged-in): hero + call-to-action
  return (
    <Container size="md" py="lg">
      <Card radius="lg" withBorder p="lg">
        <Stack gap="md">
          <Title order={2} style={{ margin: 0 }}>
            Welcome to Code Battle
          </Title>
          <Text c="dimmed">
            Solve challenges, analyze time & space complexity, and climb the
            leaderboard. Battle head-to-head or hone your skills in practice mode.
          </Text>

          <Divider />

          <Group justify="flex-end" gap="sm" wrap="wrap">
            <Button
              component={Link}
              to="/signup"
              variant="filled"
              size="md"
            >
              Sign up
            </Button>
            <Button
              component={Link}
              to="/login"
              variant="light"
              size="md"
            >
              Log in
            </Button>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}

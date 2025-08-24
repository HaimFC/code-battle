import { useEffect, useState } from "react";
import {
  Card,
  Container,
  Stack,
  Title,
  Text,
  Group,
  Divider,
  Badge,
  Progress,
  Grid,
  Button,
} from "@mantine/core";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import {
  estimateTimeComplexityFromCode,
  estimateSpaceComplexityFromCode,
} from "../utils/complexity";
import { addProfileScoreOnce } from "../utils/supabaseQueries";
import { useAuthContext } from "../context/AuthContext";

function msToHMS(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

function normBigO(s) {
  if (!s) return "";
  const t = String(s).toLowerCase().replace(/\s+/g, "");
  const map = {
    "o(1)": "O(1)",
    "o(logn)": "O(log n)",
    "o(n)": "O(n)",
    "o(nlogn)": "O(n log n)",
    "o(n^2)": "O(n^2)",
    "o(n2)": "O(n^2)",
    "o(n^3)": "O(n^3)",
    "o(2^n)": "O(2^n)",
    "o(n!)": "O(n!)",
  };
  if (map[t]) return map[t];
  if (/o\(.+?\)/.test(t)) return "O(" + t.slice(2, -1) + ")";
  return s;
}

function bigORank(s) {
  const v = normBigO(s);
  const order = [
    "O(1)",
    "O(log n)",
    "O(n)",
    "O(n log n)",
    "O(n^2)",
    "O(n^3)",
    "O(2^n)",
    "O(n!)",
  ];
  const i = order.indexOf(v);
  return i >= 0 ? i : 3;
}

function scoreFromDiff(diff) {
  if (diff <= 0) return 100;
  if (diff === 1) return 80;
  if (diff === 2) return 60;
  if (diff === 3) return 40;
  return 20;
}

export default function EndPracticePage() {
  const { state } = useLocation();
  const [params] = useSearchParams();
  const { user } = useAuthContext();
  const sid = params.get("sid") || "";

  const code = state?.code || "";
  const elapsedMs = state?.elapsedMs || 0;
  const summary = state?.summary || { passed: 0, total: 0 };
  const results = state?.results || [];
  const tests = state?.tests || [];
  const question = state?.question || null;

  const [qMeta, setQMeta] = useState({
    timeBest: normBigO(question?.TimeComplexity),
    spaceBest: normBigO(question?.SpaceComplexity),
  });
  const [timeLabel, setTimeLabel] = useState("");
  const [spaceLabel, setSpaceLabel] = useState("");
  const [awarded, setAwarded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!code) return;
      const t = estimateTimeComplexityFromCode(code, tests);
      const s = estimateSpaceComplexityFromCode(code, tests);
      if (!active) return;
      setTimeLabel(t.label || "N/A");
      setSpaceLabel(s.label || "N/A");
    })();
    return () => {
      active = false;
    };
  }, [code, tests]);

  useEffect(() => {
    let active = true;
    if ((!qMeta.timeBest || !qMeta.spaceBest) && question?.id) {
      supabase
        .from("questions")
        .select("TimeComplexity,SpaceComplexity,title")
        .eq("id", question.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!active) return;
          if (data)
            setQMeta({
              timeBest: normBigO(data.TimeComplexity),
              spaceBest: normBigO(data.SpaceComplexity),
            });
        });
    }
    return () => {
      active = false;
    };
  }, [question?.id]);

  const safeTime = timeLabel && timeLabel !== "N/A" ? timeLabel : "";
  const safeSpace = spaceLabel && spaceLabel !== "N/A" ? spaceLabel : "";

  const passedPct = summary?.total
    ? Math.round((summary.passed / summary.total) * 100)
    : 0;
  const testsScore = passedPct * 0.5;
  const timeDiff = safeTime ? bigORank(safeTime) - bigORank(qMeta.timeBest) : 0;
  const timeScore = scoreFromDiff(timeDiff) * 0.25;
  const spaceDiff = safeSpace
    ? bigORank(safeSpace) - bigORank(qMeta.spaceBest)
    : 0;
  const spaceScore = (safeSpace ? scoreFromDiff(spaceDiff) : 60) * 0.25;
  const finalScore = Math.round(testsScore + timeScore + spaceScore);

  useEffect(() => {
    if (!user?.id) return;
    if (!sid) return;
    if (awarded) return;
    if (!Number.isFinite(finalScore)) return;
    addProfileScoreOnce(user.id, finalScore, sid)
      .then((ok) => {
        if (ok) setAwarded(true);
      })
      .catch(() => {});
  }, [user?.id, sid, finalScore, awarded]);

  const navigate = useNavigate();

  function backToHome() {
    navigate("/code-battle/code-battle/");
  }

  return (
    <>
      <Container size="lg" py="lg">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Title order={3} style={{ margin: 0 }}>
              {question?.title || "Result"}
            </Title>
            <Badge color="green" variant="light">
              Score {finalScore}
            </Badge>
          </Group>

          <Card radius="lg" withBorder p="lg">
            <Stack gap="sm">
              <Title order={5}>Summary</Title>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Text size="sm" c="dimmed">
                    Time
                  </Text>
                  <Text fw={600}>{msToHMS(elapsedMs || 0)}</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Text size="sm" c="dimmed">
                    Tests
                  </Text>
                  <Text fw={600}>
                    {summary?.passed ?? 0} of {summary?.total ?? 0}
                  </Text>
                  <Progress value={passedPct} mt={6} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Stack gap="xs" align="center">
                    <Text size="sm" c="dimmed">
                      Time Complexity
                    </Text>
                    <Group gap="xs" justify="center">
                      <Badge variant="light" color="blue">
                        {safeTime || "N/A"}
                      </Badge>
                      <Text size="sm">Best {qMeta.timeBest || "-"}</Text>
                    </Group>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                  <Stack gap="xs" align="center">
                    <Text size="sm" c="dimmed">
                      Space Complexity
                    </Text>
                    <Group gap="xs" justify="center">
                      <Badge variant="light" color="violet">
                        {safeSpace || "N/A"}
                      </Badge>
                      <Text size="sm">Best {qMeta.spaceBest || "-"}</Text>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          <Card radius="lg" withBorder p="lg">
            <Stack gap="sm">
              <Title order={5}>Code</Title>
              <Card withBorder radius="md" p="md">
                <pre
                  style={{
                    textAlign: "left",
                    overflowX: "auto",
                    margin: "0 auto",
                    padding: "20px",
                    width: "max-content",
                  }}
                >
                  {code || ""}
                </pre>
              </Card>
            </Stack>
          </Card>

          <Card radius="lg" withBorder p="lg">
            <Stack gap="sm">
              <Title order={5}>Test Results</Title>
              <Stack gap={6}>
                {(results || []).slice(0, 100).map((r) => (
                  <Group key={r.i} justify="space-between">
                    <Text size="sm">Test #{r.i}</Text>
                    <Badge color={r.passed ? "green" : "red"} variant="light">
                      {r.passed ? "Passed" : "Failed"}
                    </Badge>
                    <Text size="sm" c="dimmed">
                      {r.time_ms}ms
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>

          <Card radius="lg" withBorder p="lg">
            <Stack gap="xs">
              <Title order={5}>Score Breakdown</Title>
              <Text>Tests: {Math.round(testsScore)}/50</Text>
              <Text>Time Complexity: {Math.round(timeScore)}/25</Text>
              <Text>Space Complexity: {Math.round(spaceScore)}/25</Text>
              <Divider my="sm" />
              <Title order={2}>{finalScore}</Title>
            </Stack>
          </Card>
        </Stack>
      </Container>
      <Button w={100} onClick={backToHome}>
        Back
      </Button>
    </>
  );
}

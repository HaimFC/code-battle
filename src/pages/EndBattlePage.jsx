// src/pages/EndBattlePage.jsx
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

export default function EndBattlePage() {
  const { state } = useLocation();
  const [params] = useSearchParams();
  const { user } = useAuthContext();
  const sid = params.get("sid") || "";

  const stateCode = state?.code || "";
  const stateElapsedMs = state?.elapsedMs || 0;
  const stateSummary = state?.summary || { passed: 0, total: 0 };
  const stateTests = state?.tests || [];
  const stateQuestion = state?.question || null;
  const battleId = state?.battleId || null;
  const stateTimeLabel = state?.timeLabel || "";
  const stateSpaceLabel = state?.spaceLabel || "";
  const stateFinalScore = state?.finalScore;

  const [mineRow, setMineRow] = useState(null);
  const [oppRow, setOppRow] = useState(null);

  const [qMeta, setQMeta] = useState({
    timeBest: normBigO(stateQuestion?.TimeComplexity),
    spaceBest: normBigO(stateQuestion?.SpaceComplexity),
  });

  useEffect(() => {
    let active = true;
    (async () => {
      if (qMeta.timeBest && qMeta.spaceBest) return;
      if (!battleId && !stateQuestion?.id) return;

      let qid = stateQuestion?.id || null;

      try {
        if (!qid && battleId) {
          const { data: ab } = await supabase
            .from("active_battles")
            .select("question_id")
            .eq("id", battleId)
            .maybeSingle();
          qid = ab?.question_id || null;
        }
        if (!qid) return;

        const { data: qrow } = await supabase
          .from("questions")
          .select("TimeComplexity,SpaceComplexity,title")
          .eq("id", qid)
          .maybeSingle();

        if (!active) return;
        if (qrow) {
          setQMeta({
            timeBest: normBigO(qrow.TimeComplexity),
            spaceBest: normBigO(qrow.SpaceComplexity),
          });
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, [battleId, stateQuestion?.id, qMeta.timeBest, qMeta.spaceBest]);

  useEffect(() => {
    if (!battleId || !user?.id) return;
    let canceled = false;

    (async () => {
      const { data, error } = await supabase
        .from("battle_submissions")
        .select("*")
        .eq("battle_id", battleId);

      if (canceled) return;
      if (error) return;

      const mine = (data || []).find((r) => r.user_id === user.id) || null;
      const opp = (data || []).find((r) => r.user_id !== user.id) || null;
      setMineRow(mine);
      setOppRow(opp);
    })();

    return () => {
      canceled = true;
    };
  }, [battleId, user?.id]);

  const myCode = mineRow?.code ?? stateCode;
  const mySummary = mineRow?.summary ?? stateSummary;
  const myElapsedMs =
    typeof mineRow?.elapsed_ms === "number"
      ? mineRow.elapsed_ms
      : stateElapsedMs;
  const myTimeLabelRaw =
    (mineRow?.time_label && mineRow.time_label !== "N/A"
      ? mineRow.time_label
      : "") ||
    (stateTimeLabel && stateTimeLabel !== "N/A" ? stateTimeLabel : "");
  const mySpaceLabelRaw =
    (mineRow?.space_label && mineRow.space_label !== "N/A"
      ? mineRow.space_label
      : "") ||
    (stateSpaceLabel && stateSpaceLabel !== "N/A" ? stateSpaceLabel : "");

  const [fallbackTime, setFallbackTime] = useState("");
  const [fallbackSpace, setFallbackSpace] = useState("");
  useEffect(() => {
    let active = true;
    (async () => {
      if (myTimeLabelRaw && mySpaceLabelRaw) return;
      if (!myCode) return;
      const hasTests = Array.isArray(stateTests) && stateTests.length > 0;
      if (!hasTests) return;
      const t = estimateTimeComplexityFromCode(myCode, stateTests);
      const s = estimateSpaceComplexityFromCode(myCode, stateTests);
      if (!active) return;
      setFallbackTime(t.label || "");
      setFallbackSpace(s.label || "");
    })();
    return () => {
      active = false;
    };
  }, [myCode, myTimeLabelRaw, mySpaceLabelRaw, stateTests]);

  const myTimeLabel = myTimeLabelRaw || fallbackTime || "";
  const mySpaceLabel = mySpaceLabelRaw || fallbackSpace || "";

  const myPassedPct = mySummary?.total
    ? Math.round((mySummary.passed / mySummary.total) * 100)
    : 0;
  const myTestsScore = myPassedPct * 0.5;
  const myTimeDiff = myTimeLabel
    ? bigORank(myTimeLabel) - bigORank(qMeta.timeBest)
    : 0;
  const myTimeScore = scoreFromDiff(myTimeDiff) * 0.25;
  const mySpaceDiff = mySpaceLabel
    ? bigORank(mySpaceLabel) - bigORank(qMeta.spaceBest)
    : 0;
  const mySpaceScore = (mySpaceLabel ? scoreFromDiff(mySpaceDiff) : 60) * 0.25;
  const myScoreComputed = Math.round(myTestsScore + myTimeScore + mySpaceScore);
  const myScore = Number.isFinite(mineRow?.final_score)
    ? mineRow.final_score
    : Number.isFinite(stateFinalScore)
    ? stateFinalScore
    : myScoreComputed;

  const oppScore = Number.isFinite(oppRow?.final_score)
    ? oppRow.final_score
    : 0;
  const oppElapsed = Number.isFinite(oppRow?.elapsed_ms)
    ? oppRow.elapsed_ms
    : Number.MAX_SAFE_INTEGER;

  const winnerIsMe =
    myScore > oppScore ||
    (myScore === oppScore &&
      (myElapsedMs || Number.MAX_SAFE_INTEGER) <= oppElapsed);

  const [awarded, setAwarded] = useState(false);
  useEffect(() => {
    if (!user?.id) return;
    if (awarded) return;
    if (!Number.isFinite(myScore)) return;
    addProfileScoreOnce(user.id, myScore, sid)
      .then((ok) => {
        if (ok) setAwarded(true);
      })
      .catch(() => {});
  }, [user?.id, myScore, sid, awarded]);

  const navigate = useNavigate();
  function backToHome() {
    navigate("/code-battle/");
  }

  return (
    <Container size="lg" py="lg">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={3} style={{ margin: 0 }}>
            {stateQuestion?.title || "Battle Result"}
          </Title>
          <Badge color="green" variant="light">
            {winnerIsMe ? "Winner: You" : "Winner: Opponent"}
          </Badge>
        </Group>

        <Card radius="lg" withBorder p="lg">
          <Stack gap="sm">
            <Title order={5}>Your Summary</Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">
                  Time
                </Text>
                <Text fw={600}>{msToHMS(myElapsedMs || 0)}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">
                  Tests
                </Text>
                <Text fw={600}>
                  {mySummary?.passed ?? 0} of {mySummary?.total ?? 0}
                </Text>
                <Progress value={myPassedPct} mt={6} />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Stack gap="xs" align="center">
                  <Text size="sm" c="dimmed">
                    Time Complexity
                  </Text>
                  <Group gap="xs" justify="center">
                    <Badge variant="light" color="blue">
                      {myTimeLabel || "N/A"}
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
                      {mySpaceLabel || "N/A"}
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
            <Title order={5}>Your Code</Title>
            <Card withBorder radius="md" p="md">
              <pre style={{ margin: 0, overflowX: "auto" }}>{myCode || ""}</pre>
            </Card>
          </Stack>
        </Card>

        <Card radius="lg" withBorder p="lg">
          <Stack gap="sm">
            <Title order={5}>Opponent Summary</Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">
                  Time
                </Text>
                <Text fw={600}>{msToHMS(oppRow?.elapsed_ms || 0)}</Text>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Text size="sm" c="dimmed">
                  Tests
                </Text>
                <Text fw={600}>
                  {oppRow?.summary?.passed ?? 0} of{" "}
                  {oppRow?.summary?.total ?? 0}
                </Text>
                <Progress
                  value={
                    oppRow?.summary?.total
                      ? Math.round(
                          (oppRow.summary.passed / oppRow.summary.total) * 100
                        )
                      : 0
                  }
                  mt={6}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Stack gap="xs" align="center">
                  <Text size="sm" c="dimmed">
                    Time Complexity
                  </Text>
                  <Group gap="xs" justify="center">
                    <Badge variant="light" color="blue">
                      {oppRow?.time_label || "N/A"}
                    </Badge>
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
                      {oppRow?.space_label || "N/A"}
                    </Badge>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        {/* Score */}
        <Card radius="lg" withBorder p="lg">
          <Stack gap="xs">
            <Title order={5}>Score</Title>
            <Group justify="space-between">
              <Text>You: {myScore}</Text>
              <Text>Opponent: {oppScore}</Text>
            </Group>
            <Divider my="sm" />
            <Title order={2}>{winnerIsMe ? "You Win" : "Opponent Wins"}</Title>
          </Stack>
        </Card>
      </Stack>
      <Button onClick={backToHome}>Home</Button>
    </Container>
  );
}

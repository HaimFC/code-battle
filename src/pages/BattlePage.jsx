// src/pages/BattlePage.jsx
import { Title, Button, Text } from "@mantine/core";
import CodeEditor from "../components/CodeEditor";
import ProfileImage from "../components/ProfileImage";
import { useState, useEffect, useRef, useMemo } from "react";
import "../styles/BattlePage.css";
import {
  getQuestionWithTests,
  upsertBattleSubmission,
} from "../utils/supabaseQueries";
import { runTests } from "../api/judge0";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { useAuthContext } from "../context/AuthContext";
import {
  estimateTimeComplexityFromCode,
  estimateSpaceComplexityFromCode,
} from "../utils/complexity";

const POLL_MS = 1200;

function formatTime(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
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
function isPlaceholderCode(code) {
  if (!code) return true;
  const src = String(code);
  if (/\/\/\s*your\s*code/i.test(src)) return true;
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .trim();
  if (stripped === "") return true;
  if (/function\s+[A-Za-z_$][\w$]*\s*\([^)]*\)\s*{\s*}/m.test(stripped))
    return true;
  if (/\([^)]*\)\s*=>\s*{\s*}/m.test(stripped)) return true;
  return false;
}

export default function BattlePage({
  comp,
  players = [],
  question: questionProp,
}) {
  const MIN_SUBMIT_SEC = Number(import.meta.env.VITE_MIN_SUBMIT_SEC ?? 180);
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { battleId: routeBattleId } = useParams();
  const isBattle = !!routeBattleId;

  const [question, setQuestion] = useState(questionProp || null);
  const [tests, setTests] = useState([]);
  const [opponentName, setOpponentName] = useState("");

  const [code, setCode] = useState(questionProp?.initialValue ?? "");
  const [output, setOutput] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const [lastSummary, setLastSummary] = useState({ passed: 0, total: 0 });
  const [lastResults, setLastResults] = useState([]);
  const [timeLabel, setTimeLabel] = useState("");
  const [spaceLabel, setSpaceLabel] = useState("");

  const [opFinished, setOpFinished] = useState(false);
  const [meFinished, setMeFinished] = useState(false);

  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownLeft, setCountdownLeft] = useState(120);
  const [timeLimitSec, setTimeLimitSec] = useState(120);

  const startMsRef = useRef(Date.now());
  const cdStartMsRef = useRef(0);
  const roleRef = useRef("A");
  const oppIdRef = useRef(null);

  const countdownActiveRef = useRef(false);
  const timeLimitSecRef = useRef(120);

  useEffect(() => {
    countdownActiveRef.current = countdownActive;
  }, [countdownActive]);
  useEffect(() => {
    timeLimitSecRef.current = timeLimitSec;
  }, [timeLimitSec]);

  const myName = useMemo(() => {
    if (players[0]?.name) return players[0].name;
    const m = user?.user_metadata || {};
    const full = [m.first_name, m.last_name].filter(Boolean).join(" ");
    return m.display_name || full || (user?.email?.split("@")[0] ?? "You");
  }, [players, user]);

  const showComp = isBattle || comp;
  const loaded = !!question?.id && Array.isArray(tests) && tests.length > 0;

  function computeFinalScore() {
    const passed = lastSummary?.passed ?? 0;
    const total = lastSummary?.total ?? 0;
    const passedPct = total ? Math.round((passed / total) * 100) : 0;
    const testsScore = passedPct * 0.5;
    const allFailed = total > 0 && passed === 0;
    const placeholder = isPlaceholderCode(code);
    if (allFailed || placeholder) {
      return Math.round(testsScore);
    }
    const hasTime = timeLabel && timeLabel !== "N/A";
    const hasSpace = spaceLabel && spaceLabel !== "N/A";
    const qBestT = normBigO(question?.TimeComplexity || "");
    const qBestS = normBigO(question?.SpaceComplexity || "");
    let timeScore = 0;
    if (hasTime) {
      const timeDiff = bigORank(timeLabel) - bigORank(qBestT);
      timeScore = scoreFromDiff(timeDiff) * 0.25;
    }
    let spaceScore = 0;
    if (hasSpace) {
      const spaceDiff = bigORank(spaceLabel) - bigORank(qBestS);
      spaceScore = scoreFromDiff(spaceDiff) * 0.25;
    }
    return Math.round(testsScore + timeScore + spaceScore);
  }

  function navigateToEnd(finalScore, elapsedMsOverride) {
    const sid =
      (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) +
      "-" +
      (question?.id || "q");
    const payload = {
      code,
      elapsedMs:
        typeof elapsedMsOverride === "number"
          ? elapsedMsOverride
          : elapsed * 1000,
      summary: lastSummary,
      results: lastResults,
      tests,
      question,
      timeLabel,
      spaceLabel,
      finalScore,
    };
    if (isBattle) {
      navigate(`/end-battle?sid=${encodeURIComponent(sid)}`, {
        state: { ...payload, battleId: Number(routeBattleId) },
      });
    } else {
      navigate(`/end-practice?sid=${encodeURIComponent(sid)}`, {
        state: payload,
      });
    }
  }

  function applyDelta(deltaRow) {
    if (!deltaRow) return;
    if (typeof deltaRow.time_limit_sec === "number")
      setTimeLimitSec(deltaRow.time_limit_sec);
    const myRole = roleRef.current;
    const aFin = deltaRow.user_a_status === "finished";
    const bFin = deltaRow.user_b_status === "finished";
    const myFin = myRole === "A" ? aFin : bFin;
    const oppFin = myRole === "A" ? bFin : aFin;
    setMeFinished(myFin);
    setOpFinished(oppFin);
    if (deltaRow.started_at && startMsRef.current === 0) {
      startMsRef.current = new Date(deltaRow.started_at).getTime();
    }
    const tA = deltaRow.user_a_finished_at
      ? new Date(deltaRow.user_a_finished_at).getTime()
      : Infinity;
    const tB = deltaRow.user_b_finished_at
      ? new Date(deltaRow.user_b_finished_at).getTime()
      : Infinity;
    const firstFinishMs = Math.min(tA, tB);
    if (Number.isFinite(firstFinishMs) && !(aFin && bFin)) {
      cdStartMsRef.current = firstFinishMs;
      if (!myFin) setCountdownActive(true);
      const now = Date.now();
      const left = Math.max(
        0,
        Math.ceil(
          (cdStartMsRef.current +
            (deltaRow.time_limit_sec || timeLimitSecRef.current) * 1000 -
            now) /
            1000
        )
      );
      setCountdownLeft(left);
    }
    if (aFin && bFin) {
      const fs = computeFinalScore();
      navigateToEnd(fs);
    }
  }

  useEffect(() => {
    if (!isBattle || !routeBattleId || !user?.id) return;
    let cancelled = false;
    (async () => {
      const { data: base, error } = await supabase
        .from("active_battles")
        .select("id, question_id, user_a, user_b, started_at, time_limit_sec")
        .eq("id", routeBattleId)
        .maybeSingle();
      if (cancelled) return;
      if (error || !base) return;
      const myId = user?.id || null;
      roleRef.current = base.user_a === myId ? "A" : "B";
      const oppId = roleRef.current === "A" ? base.user_b : base.user_a;
      if (oppId) {
        supabase
          .from("profiles")
          .select("display_name,first_name,last_name")
          .eq("id", oppId)
          .maybeSingle()
          .then(({ data: prof }) => {
            const name =
              prof?.display_name ||
              [prof?.first_name, prof?.last_name].filter(Boolean).join(" ") ||
              "Opponent";
            setOpponentName(name);
          })
          .catch(() => setOpponentName("Opponent"));
        oppIdRef.current = oppId;
      }
      startMsRef.current = base.started_at
        ? new Date(base.started_at).getTime()
        : Date.now();
      setTimeLimitSec(base.time_limit_sec || 120);
      if (!questionProp && base.question_id) {
        try {
          const { question: q } = await getQuestionWithTests(base.question_id);
          if (cancelled) return;
          setQuestion(q);
          setCode(q.initialValue ?? "");
        } catch {
          if (!cancelled) setOutput("Failed to load question/tests");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isBattle, routeBattleId, user?.id, questionProp]);

  useEffect(() => {
    if (!isBattle || !routeBattleId || !user?.id) return;
    let stopped = false;
    const fetchDelta = async () => {
      const { data, error } = await supabase
        .from("active_battles")
        .select(
          "status, started_at, time_limit_sec, user_a_status, user_b_status, user_a_finished_at, user_b_finished_at, finished_at"
        )
        .eq("id", routeBattleId)
        .maybeSingle();
      if (stopped) return;
      if (error || !data) return;
      applyDelta(data);
    };
    fetchDelta();
    const id = setInterval(fetchDelta, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [isBattle, routeBattleId, user?.id]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const sec = Math.floor((now - startMsRef.current) / 1000);
      setElapsed(sec);
      if (countdownActiveRef.current) {
        const left = Math.max(
          0,
          Math.ceil(
            (cdStartMsRef.current + timeLimitSecRef.current * 1000 - now) / 1000
          )
        );
        setCountdownLeft(left);
        if (left === 0) {
          const fs = computeFinalScore();
          const elapsedOverride =
            Math.floor((now - startMsRef.current) / 1000) * 1000;
          navigateToEnd(fs, elapsedOverride);
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!question?.id) return;
    setCode(question?.initialValue ?? "");
  }, [question?.id]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!question?.id) return;
      try {
        const { tests: t } = await getQuestionWithTests(question.id);
        if (!active) return;
        setTests(Array.isArray(t) ? t : []);
      } catch {
        if (active) setTests([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [question?.id]);

  const handleRunTests = async () => {
    try {
      setOutput("Running tests...");
      if (!question?.id) {
        setOutput("No question id");
        return;
      }
      if (!Array.isArray(tests) || tests.length === 0) {
        try {
          const { tests: t } = await getQuestionWithTests(question.id);
          setTests(Array.isArray(t) ? t : []);
          if (!t || t.length === 0) {
            setOutput("No tests found");
            return;
          }
        } catch {
          setOutput("Failed to load tests");
          return;
        }
      }
      const res = await runTests({ userCode: code, tests });
      setLastSummary(res?.summary || { passed: 0, total: 0 });
      setLastResults(res?.results || []);
      const lines = [];
      lines.push(
        `Passed ${res?.summary?.passed ?? 0} of ${res?.summary?.total ?? 0}`
      );
      (res?.results || []).slice(0, 50).forEach((r) => {
        const tag = r.passed ? "OK" : "FAIL";
        lines.push(`#${r.i} ${tag} ${r.time_ms}ms`);
        if (!r.passed) {
          lines.push(` expected: ${JSON.stringify(r.expected)}`);
          lines.push(` got:      ${JSON.stringify(r.got)}`);
          if (r.error) lines.push(` error:    ${r.error}`);
        }
      });
      setOutput(lines.join("\n"));
      const allFailed =
        (res?.summary?.total ?? 0) > 0 && (res?.summary?.passed ?? 0) === 0;
      const placeholder = isPlaceholderCode(code);
      if (placeholder || allFailed) {
        setTimeLabel("N/A");
        setSpaceLabel("N/A");
      } else {
        const t = estimateTimeComplexityFromCode(code, tests);
        const s = estimateSpaceComplexityFromCode(code, tests);
        setTimeLabel(t.label || "N/A");
        setSpaceLabel(s.label || "N/A");
      }
    } catch (e) {
      setOutput(String(e));
    }
  };

  const handleSubmit = async () => {
    if (!question?.id) {
      setOutput("No question id");
      return;
    }
    if (!Array.isArray(tests) || tests.length === 0) {
      setOutput("No tests found");
      return;
    }
    if (isBattle) {
      const nowSec = Math.floor((Date.now() - startMsRef.current) / 1000);
      if (nowSec < MIN_SUBMIT_SEC) {
        setOutput(`Cannot finish before ${formatTime(MIN_SUBMIT_SEC)}`);
        return;
      }
    }
    if (!lastSummary?.total) {
      await handleRunTests();
    }
    const finalScore = computeFinalScore();
    if (isBattle && user?.id && routeBattleId) {
      await upsertBattleSubmission({
        battle_id: Number(routeBattleId),
        user_id: user.id,
        code,
        tests,
        summary: lastSummary,
        results: lastResults,
        time_label: timeLabel || null,
        space_label: spaceLabel || null,
        final_score: finalScore,
        elapsed_ms: Math.floor((Date.now() - startMsRef.current) / 1000) * 1000,
      });
      const update =
        roleRef.current === "A"
          ? {
              user_a_status: "finished",
              user_a_finished_at: new Date().toISOString(),
            }
          : {
              user_b_status: "finished",
              user_b_finished_at: new Date().toISOString(),
            };
      const { data: delta } = await supabase
        .from("active_battles")
        .update(update)
        .eq("id", routeBattleId)
        .select(
          "status, started_at, time_limit_sec, user_a_status, user_b_status, user_a_finished_at, user_b_finished_at, finished_at"
        )
        .maybeSingle();
      if (delta) applyDelta(delta);
      setMeFinished(true);
      const oppFinishedNow =
        roleRef.current === "A"
          ? delta?.user_b_status === "finished"
          : delta?.user_a_status === "finished";
      if (oppFinishedNow) {
        navigateToEnd(finalScore);
      } else if (!countdownActiveRef.current) {
        setCountdownActive(true);
        const finTs =
          roleRef.current === "A"
            ? delta?.user_a_finished_at
            : delta?.user_b_finished_at;
        cdStartMsRef.current = finTs ? new Date(finTs).getTime() : Date.now();
      }
    } else {
      navigateToEnd(finalScore);
    }
  };
  async function handleQuit() {
    if (!isBattle) {
      navigate("/code-battle/");
      return;
    }
    setMeFinished(true);
    navigate("/code-battle/");
  }

  return (
    <div className="battle-shell">
      <Button
        top={"35px"}
        left={"25px"}
        w={100}
        bg="#d11a2a"
        onClick={handleQuit}
      >
        Quit
      </Button>
      <div className="battle-header">
        <Title
          className="screen-timer"
          order={2}
          style={{ color: countdownActive ? "#d11a2a" : undefined }}
        >
          {countdownActive ? formatTime(countdownLeft) : formatTime(elapsed)}
        </Title>
      </div>
      <div className="battle-page">
        <div className="left-panel">
          <div className="players-card">
            <div className="p-slot left">
              <div className="p-info">
                <Title order={5}>{myName}</Title>
                <Text size="sm" c="dimmed">
                  {meFinished ? "finished" : "coding"}
                </Text>
              </div>
              <ProfileImage name={myName} color="red" />
            </div>
            {showComp && <div className="vs">VS</div>}
            {showComp && (
              <div className="p-slot right">
                <ProfileImage
                  name={opponentName || players[1]?.name || "Opponent"}
                  color="blue"
                />
                <div className="p-info">
                  <Title order={5}>
                    {opponentName || players[1]?.name || "Opponent"}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {opFinished ? "finished" : "coding"}
                  </Text>
                </div>
              </div>
            )}
          </div>
          <div className="question">
            <div className="code">
              <Title order={6}>Code Editor</Title>
              <div className="editor">
                <CodeEditor code={code} setCode={setCode} />
              </div>
              <div className="code-actions">
                <Button fullWidth onClick={handleRunTests} disabled={!loaded}>
                  Run Tests
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="right-panel">
          <Button
            variant="filled"
            size="xl"
            color="green"
            radius="md"
            onClick={handleSubmit}
            disabled={(isBattle && elapsed < MIN_SUBMIT_SEC) || !loaded}
          >
            Submit
          </Button>
          <div className="panel-section">
            <Title order={6} className="section-title">
              Question Description
            </Title>
            <Text className="section-content description" size="lg" mb="md">
              {question?.description ?? ""}
            </Text>
          </div>
          <div className="panel-section">
            <Title order={6} className="section-title">
              Output
            </Title>
            <pre className="section-content output">{output || ""}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

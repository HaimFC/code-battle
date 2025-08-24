import { Title, Button, Text } from "@mantine/core";
import CodeEditor from "../components/CodeEditor";
import ProfileImage from "../components/ProfileImage";
import { useState, useEffect, useRef } from "react";
import "../styles/BattlePage.css";
import { getQuestionWithTests, upsertBattleSubmission } from "../utils/supabaseQueries";
import { runTests } from "../api/judge0";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import { useAuthContext } from "../context/AuthContext";
import { estimateTimeComplexityFromCode, estimateSpaceComplexityFromCode } from "../utils/complexity";

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
  const map = { "o(1)":"O(1)","o(logn)":"O(log n)","o(n)":"O(n)","o(nlogn)":"O(n log n)","o(n^2)":"O(n^2)","o(n2)":"O(n^2)","o(n^3)":"O(n^3)","o(2^n)":"O(2^n)","o(n!)":"O(n!)" };
  if (map[t]) return map[t];
  if (/o\(.+?\)/.test(t)) return "O(" + t.slice(2, -1) + ")";
  return s;
}
function bigORank(s) {
  const v = normBigO(s);
  const order = ["O(1)","O(log n)","O(n)","O(n log n)","O(n^2)","O(n^3)","O(2^n)","O(n!)"];
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

function BattlePage({ comp, players = [], question }) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { battleId: routeBattleId } = useParams();
  const isBattle = !!routeBattleId;
  const [code, setCode] = useState(question?.initialValue ?? "");
  const [elapsed, setElapsed] = useState(0);
  const [output, setOutput] = useState("");
  const [tests, setTests] = useState([]);
  const [lastSummary, setLastSummary] = useState({ passed: 0, total: 0 });
  const [lastResults, setLastResults] = useState([]);
  const [timeLabel, setTimeLabel] = useState("");
  const [spaceLabel, setSpaceLabel] = useState("");
  const [canFinish, setCanFinish] = useState(false);
  const [opFinished, setOpFinished] = useState(false);
  const [meFinished, setMeFinished] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownLeft, setCountdownLeft] = useState(120);
  const startRef = useRef(Date.now());
  const cdStartRef = useRef(0);
  const chanRef = useRef(null);
  const roleRef = useRef("A");

  function computeFinalScore() {
    const passedPct = lastSummary?.total ? Math.round((lastSummary.passed / lastSummary.total) * 100) : 0;
    const testsScore = passedPct * 0.5;
    const qBestT = normBigO(question?.TimeComplexity || "");
    const qBestS = normBigO(question?.SpaceComplexity || "");
    const timeDiff = timeLabel ? bigORank(timeLabel) - bigORank(qBestT) : 0;
    const timeScore = scoreFromDiff(timeDiff) * 0.25;
    const spaceDiff = spaceLabel ? bigORank(spaceLabel) - bigORank(qBestS) : 0;
    const spaceScore = (spaceLabel ? scoreFromDiff(spaceDiff) : 60) * 0.25;
    return Math.round(testsScore + timeScore + spaceScore);
  }

  function navigateToEnd(finalScore, elapsedMsOverride) {
    const sid = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + "-" + (question?.id || "q");
    const payload = {
      code,
      elapsedMs: typeof elapsedMsOverride === "number" ? elapsedMsOverride : elapsed * 1000,
      summary: lastSummary,
      results: lastResults,
      tests,
      question,
      timeLabel,
      spaceLabel,
      finalScore
    };
    if (isBattle) {
      navigate(`/end-battle?sid=${encodeURIComponent(sid)}`, { state: { ...payload, battleId: Number(routeBattleId) } });
    } else {
      navigate(`/end-practice?sid=${encodeURIComponent(sid)}`, { state: payload });
    }
  }

  useEffect(() => {
    const start = Date.now();
    startRef.current = start;
    const id = setInterval(() => {
      const sec = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(sec);
      setCanFinish(sec >= 180);
      if (countdownActive) {
        const left = Math.max(0, 120 - Math.floor((Date.now() - cdStartRef.current) / 1000));
        setCountdownLeft(left);
        if (left === 0) {
          const fs = computeFinalScore();
          const elapsedOverride = Math.floor((Date.now() - start) / 1000) * 1000;
          navigateToEnd(fs, elapsedOverride);
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [countdownActive]);

  useEffect(() => {
    setCode(question?.initialValue ?? "");
  }, [question?.id]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!question?.id) return;
      const { tests: t } = await getQuestionWithTests(question.id);
      if (!active) return;
      setTests(Array.isArray(t) ? t : []);
    })();
    return () => { active = false; };
  }, [question?.id]);

  useEffect(() => {
    if (!isBattle || !user?.id || !routeBattleId) return;
    let unsub = () => {};
    (async () => {
      const { data } = await supabase.from("active_battles").select("id,user_a,user_b,user_a_status,user_b_status,started_at").eq("id", routeBattleId).maybeSingle();
      if (data?.started_at) startRef.current = new Date(data.started_at).getTime();
      if (data?.user_a && data.user_a === user.id) roleRef.current = "A";
      else roleRef.current = "B";
      if (data?.user_a_status === "finished" || data?.user_b_status === "finished") {
        setCountdownActive(true);
        cdStartRef.current = Date.now();
      }
      if ((roleRef.current === "A" && data?.user_b_status === "finished") || (roleRef.current === "B" && data?.user_a_status === "finished")) setOpFinished(true);
      const ch = supabase
        .channel(`ab-${routeBattleId}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "active_battles", filter: `id=eq.${routeBattleId}` }, (payload) => {
          const row = payload.new;
          if ((roleRef.current === "A" && row.user_b_status === "finished") || (roleRef.current === "B" && row.user_a_status === "finished")) {
            setOpFinished(true);
            if (!countdownActive) {
              setCountdownActive(true);
              cdStartRef.current = Date.now();
            }
          }
        })
        .subscribe();
      chanRef.current = ch;
      unsub = () => supabase.removeChannel(ch);
    })();
    return () => unsub();
  }, [isBattle, user?.id, routeBattleId]);

  const handleRunTests = async () => {
    try {
      setOutput("Running tests...");
      if (!question?.id) {
        setOutput("No question id");
        return;
      }
      if (!Array.isArray(tests) || tests.length === 0) {
        setOutput("No tests found");
        return;
      }
      const res = await runTests({ userCode: code, tests });
      setLastSummary(res?.summary || { passed: 0, total: 0 });
      setLastResults(res?.results || []);
      const lines = [];
      lines.push(`Passed ${res?.summary?.passed ?? 0} of ${res?.summary?.total ?? 0}`);
      (res?.results || []).slice(0, 50).forEach(r => {
        const tag = r.passed ? "OK" : "FAIL";
        lines.push(`#${r.i} ${tag} ${r.time_ms}ms`);
        if (!r.passed) {
          lines.push(` expected: ${JSON.stringify(r.expected)}`);
          lines.push(` got:      ${JSON.stringify(r.got)}`);
          if (r.error) lines.push(` error:    ${r.error}`);
        }
      });
      setOutput(lines.join("\n"));
      const t = estimateTimeComplexityFromCode(code, tests);
      const s = estimateSpaceComplexityFromCode(code, tests);
      setTimeLabel(t.label || "N/A");
      setSpaceLabel(s.label || "N/A");
    } catch (e) {
      setOutput(String(e));
    }
  };

  const handleSubmit = async () => {
    if (!question?.id) return;
    if (!Array.isArray(tests) || tests.length === 0) return;
    if (!canFinish && isBattle) {
      setOutput("Cannot finish before 3:00");
      return;
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
        elapsed_ms: elapsed * 1000
      });
      if (roleRef.current === "A") {
        await supabase.from("active_battles").update({ user_a_status: "finished" }).eq("id", routeBattleId);
      } else {
        await supabase.from("active_battles").update({ user_b_status: "finished" }).eq("id", routeBattleId);
      }
      setMeFinished(true);
      if (!countdownActive) {
        setCountdownActive(true);
        cdStartRef.current = Date.now();
      }
      if (opFinished) {
        navigateToEnd(finalScore);
      }
    } else {
      navigateToEnd(finalScore);
    }
  };

  return (
    <div className="battle-shell">
      <div className="battle-header">
        <Title className="screen-timer" order={2} style={{ color: countdownActive ? "#d11a2a" : undefined }}>
          {countdownActive ? formatTime(countdownLeft) : formatTime(elapsed)}
        </Title>
      </div>

      <div className="battle-page">
        <div className="left-panel">
          <div className="players-card">
            <div className="p-slot left">
              <div className="p-info">
                <Title order={5}>{players[0]?.name ?? "Player 1"}</Title>
                <Text size="sm" c="dimmed">
                  {meFinished ? "finished" : "coding"}
                </Text>
              </div>
              <ProfileImage name={players[0]?.name ?? "P1"} color="red" />
            </div>

            {comp && <div className="vs">VS</div>}

            {comp && players[1] && (
              <div className="p-slot right">
                <ProfileImage name={players[1]?.name ?? "P2"} color="blue" />
                <div className="p-info">
                  <Title order={5}>{players[1]?.name ?? "Player 2"}</Title>
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
                <Button fullWidth onClick={handleRunTests}>
                  Run Tests
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <Button variant="filled" size="xl" color="green" radius="md" onClick={handleSubmit} disabled={isBattle && !canFinish}>
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
            <pre className="section-content output">
              {output || ""}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattlePage;

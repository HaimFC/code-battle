import { Title, Button, Text } from "@mantine/core";
import CodeEditor from "../components/CodeEditor";
import ProfileImage from "../components/ProfileImage";
import { useState, useEffect } from "react";
import "../styles/BattlePage.css";
import { getQuestionWithTests } from "../utils/supabaseQueries";
import { runTests } from "../api/judge0";
import { useNavigate } from "react-router-dom";

function formatTime(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function BattlePage({ comp, players = [], question }) {
  const navigate = useNavigate();
  const [code, setCode] = useState(question?.initialValue ?? "");
  const [elapsed, setElapsed] = useState(0);
  const [output, setOutput] = useState("");
  const [tests, setTests] = useState([]);
  const [lastSummary, setLastSummary] = useState({ passed: 0, total: 0 });
  const [lastResults, setLastResults] = useState([]);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

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
    } catch (e) {
      setOutput(String(e));
    }
  };

  const handleSubmit = () => {
    const sid =
      (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) +
      "-" + (question?.id || "q");

    navigate(`/end?sid=${encodeURIComponent(sid)}`, {
      state: {
        code,
        elapsedMs: elapsed * 1000,
        summary: lastSummary,
        results: lastResults,
        tests,
        question
      }
    });
  };
  
  return (
    <div className="battle-shell">
      <div className="battle-header">
        <Title className="screen-timer" order={2}>
          {formatTime(elapsed)}
        </Title>
      </div>

      <div className="battle-page">
        <div className="left-panel">
          <div className="players-card">
            <div className="p-slot left">
              <div className="p-info">
                <Title order={5}>{players[0]?.name ?? "Player 1"}</Title>
                <Text size="sm" c="dimmed">
                  {players[0]?.status ?? "Waiting"}
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
                    {players[1]?.status ?? "Waiting"}
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
          <Button variant="filled" size="xl" color="green" radius="md" onClick={handleSubmit}>
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

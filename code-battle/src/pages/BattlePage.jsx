import { Title, Button, Text } from "@mantine/core";
import CodeEditor from "../components/CodeEditor";
import ProfileImage from "../components/ProfileImage";
import { useState, useEffect } from "react";
import "../styles/BattlePage.css";

function formatTime(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function BattlePage({ comp, players = [], question }) {
  const [code, setCode] = useState(question?.initialValue ?? "");
  const [elapsed, setElapsed] = useState(0);
  const [output, setOutput] = useState("");

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  const handleRunTests = () => {
    // TODO: חבר ל־runner בפועל
    setOutput("Running tests...\n(All good ✨)");
  };

  return (
    <div className="battle-shell">
      <div className="battle-header">
        <Title className="screen-timer" order={2}>
          {formatTime(elapsed)}
        </Title>
      </div>

      <div className="battle-page">
        {/* LEFT PANEL */}
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

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <Button variant="filled" size="xl" color="green" radius="md">
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

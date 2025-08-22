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

function BattlePage({ comp, players, question }) {
  const [code, setCode] = useState(question.initialValue);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, []);

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
                <Title size={16}>{players[0].name}</Title>
                <Title size={12}>{players[0].status}</Title>
              </div>
              <ProfileImage name={players[0].name} color="red" />
            </div>

            {comp && <div className="vs">VS</div>}

            {comp && (
              <div className="p-slot right">
                <ProfileImage name={players[1].name} color="blue" />
                <div className="p-info">
                  <Title size={16}>{players[1].name}</Title>
                  <Title size={12}>{players[1].status}</Title>
                </div>
              </div>
            )}
          </div>

          <div className="question">
            <div className="code">
              <Title size={10}>Code Editor</Title>
              <div className="editor">
                <CodeEditor code={code} setCode={setCode} />
              </div>
              <div className="code-actions">
                <Button fullWidth>Run Tests</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <Button variant="filled" size="xl" color="green" radius="md">
            Submit
          </Button>

          <div className="panel-section">
            <Title size={10} className="section-title">
              Question Description
            </Title>
            <Text className="section-content description" size="lg" mb="md">
              {question.description}
            </Text>
          </div>

          <div className="panel-section">
            <Title size={10} className="section-title">
              Output
            </Title>
            <pre className="section-content output">{}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattlePage;

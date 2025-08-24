// Loads a random question by difficulty and renders BattlePage in practice mode
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router";
import { getRandomQuestionByDifficulty } from "../utils/supabaseQueries";
import { useAuthContext } from "../context/AuthContext";
import BattlePage from "./BattlePage";
import { Center, Loader, Alert } from "@mantine/core";

export default function LoadingPracticeQuestion() {
  const { difficulty } = useParams();
  const { user } = useAuthContext();
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const playerName = useMemo(() => {
    const m = user?.user_metadata || {};
    const full = [m.first_name, m.last_name].filter(Boolean).join(" ");
    return m.display_name || full || (user?.email?.split("@")[0] ?? "You");
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const q = await getRandomQuestionByDifficulty(difficulty);
        setQuestion(q);
      } catch (e) {
        setError(e?.message || "Failed to load question");
      } finally {
        setLoading(false);
      }
    })();
  }, [difficulty]);

  if (loading) {
    return (
      <Center h={300}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h={300}>
        <Alert color="red">{error}</Alert>
      </Center>
    );
  }

  const players = [{ name: playerName, status: "Coding..." }];

  return <BattlePage comp={false} players={players} question={question} />;
}

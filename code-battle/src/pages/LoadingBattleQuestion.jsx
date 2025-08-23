import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import { supabase } from "../api/supabaseClient";
import { Center, Loader, Alert } from "@mantine/core";
import BattlePage from "./BattlePage";

function nameFromProfile(p) {
  const full = [p?.first_name, p?.last_name].filter(Boolean).join(" ");
  return p?.display_name || full || "Player";
}

export default function LoadingBattleQuestion() {
  const { user, loading } = useAuthContext();
  const { battleId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!battleId) {
      navigate("/battle", { replace: true });
      return;
    }

    (async () => {
      try {
        const { data: b, error: bErr } = await supabase
          .from("active_battles")
          .select("id,status,question_id,user_a,user_b")
          .eq("id", battleId)
          .single();
        if (bErr) throw bErr;

        const { data: q, error: qErr } = await supabase
          .from("questions")
          .select("id,title,description,initialValue:InitialValue")
          .eq("id", b.question_id)
          .single();
        if (qErr) throw qErr;

        const { data: profs, error: pErr } = await supabase
          .from("profiles")
          .select("id,display_name,first_name,last_name")
          .in("id", [b.user_a, b.user_b]);
        if (pErr) throw pErr;

        const map = new Map(profs.map((p) => [p.id, p]));
        const ordered = user.id === b.user_a ? [b.user_a, b.user_b] : [b.user_b, b.user_a];

        setPlayers([
          { name: nameFromProfile(map.get(ordered[0])) || "You", status: "Coding..." },
          { name: nameFromProfile(map.get(ordered[1])) || "Opponent", status: "Coding..." },
        ]);

        setQuestion({
          id: q.id,
          title: q.title || "",
          description: q.description || "",
          initialValue: q.initialValue || "",
          difficulty: "",
        });
      } catch (e) {
        setError(e?.message || "Failed to load battle");
      }
    })();
  }, [battleId, user, loading, navigate]);

  if (loading || (!question && !error)) {
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

  return <BattlePage comp={true} players={players} question={question} />;
}

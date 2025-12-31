import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import BattlePage from "./BattlePage";

export default function LoadingBattleQuestion() {
  const { battleId } = useParams();
  const [ready, setReady] = useState(false);
  const [question, setQuestion] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: battle, error: e1 } = await supabase
        .from("active_battles")
        .select("id,status,question_id,user_a,user_b")
        .eq("id", Number(battleId))
        .maybeSingle();

      if (e1 || !battle || !active) {
        setReady(true);
        return;
      }

      const { data: q, error: e2 } = await supabase
        .from("questions")
        .select("id,title,description,InitialValue")
        .eq("id", battle.question_id)
        .maybeSingle();

      if (e2 || !q || !active) {
        setReady(true);
        return;
      }

      const ids = [battle.user_a, battle.user_b].filter(Boolean);
      let profiles = [];
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, display_name, first_name, last_name")
          .in("id", ids);
        profiles = (profs || []).map(p => ({
          id: p.id,
          name: p.display_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || "Player"
        }));
      }

      const pA = profiles.find(p => p.id === battle.user_a) || { name: "Player 1", status: "Ready" };
      const pB = profiles.find(p => p.id === battle.user_b) || { name: "Player 2", status: "Ready" };

      setPlayers([pA, pB]);
      setQuestion({
        id: q.id,
        title: q.title || "",
        description: q.description || "",
        initialValue: q.InitialValue || ""
      });
      setReady(true);
    })();
    return () => { active = false; };
  }, [battleId]);

  if (!ready || !question) return null;

  return (
    <BattlePage comp={true} players={players} question={question} />
  );
}

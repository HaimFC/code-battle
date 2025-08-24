import { useState, useEffect, useRef } from "react";
import { Button, Flex } from "@mantine/core";
import { useAuthContext } from "../context/AuthContext";
import { enqueueAndMatch, leaveQueue } from "../utils/supabaseQueries";
import BattleModeCard from "../components/battleModeCard";
import { useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import "../styles/BattleListPage.css";

const modes = ["easy", "medium", "hard", "hell"];

function BattleListPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [onModes, setOnModes] = useState(new Set());
  const [loadingModes, setLoadingModes] = useState(new Set());
  const [searching, setSearching] = useState(false);
  const [prevOnModes, setPrevOnModes] = useState(new Set());

  const pollRef = useRef(null);
  const channelRef = useRef(null);

  const toggleMode = (mode) => {
    if (searching) return;
    setOnModes((prev) => {
      const next = new Set(prev);
      if (next.has(mode)) next.delete(mode);
      else next.add(mode);
      return next;
    });
  };

  async function cleanup(leave = false) {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (leave && user?.id) {
      try {
        await leaveQueue(user.id);
      } catch {}
    }
  }

  function startRealtimeWatch() {
    if (channelRef.current || !user?.id) return;
    channelRef.current = supabase
      .channel(`ab-watch-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "active_battles" },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          if (row.user_a === user.id || row.user_b === user.id) {
            cleanup(true).then(() => navigate(`/battle/${row.id}`));
          }
        }
      )
      .subscribe();
  }

  const handleSearch = async () => {
    if (!user?.id || onModes.size === 0) return;

    setPrevOnModes(new Set(onModes));
    setLoadingModes(new Set(onModes));
    setSearching(true);

    startRealtimeWatch();

    try {
      const res = await enqueueAndMatch(user.id, onModes);
      if (res) {
        await cleanup(true);
        navigate(`/battle/${res.battleId}`);
        return;
      }
      pollRef.current = window.setInterval(async () => {
        try {
          const tryAgain = await enqueueAndMatch(user.id, onModes);
          if (tryAgain) {
            await cleanup(true);
            navigate(`/battle/${tryAgain.battleId}`);
          }
        } catch {}
      }, 5000);
    } catch {
      setSearching(false);
      setLoadingModes(new Set());
      await cleanup(true);
    }
  };

  const handleCancel = async () => {
    setSearching(false);
    setLoadingModes(new Set());
    setOnModes(new Set(prevOnModes));
    await cleanup(true);
  };

  useEffect(() => {
    return () => {
      cleanup(true);
    };
  }, []);

  function backToHome() {
    navigate("/code-battle/");
  }
  return (
    <div className="battle-list-page">
      <Button bottom={"15px"} left={"25px"} w={100} onClick={backToHome}>
        Back
      </Button>
      <h1 className="battle-title">Battle</h1>
      <Flex className="battle-cards">
        {modes.map((mode) => (
          <BattleModeCard
            key={mode}
            img={`/images/${mode}.png`}
            diff={mode}
            checked={onModes.has(mode)}
            loading={loadingModes.has(mode)}
            disabled={searching && !onModes.has(mode)}
            onToggle={() => toggleMode(mode)}
          />
        ))}
      </Flex>
      <div className="battle-actions">
        {searching ? (
          <Button
            className="search-btn"
            color="red"
            size="md"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        ) : (
          <Button
            className="search-btn"
            color="blue"
            size="md"
            onClick={handleSearch}
            disabled={onModes.size === 0}
          >
            Search
          </Button>
        )}
      </div>
    </div>
  );
}

export default BattleListPage;

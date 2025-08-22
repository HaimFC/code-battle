import { useState } from "react";
import { Button } from "@mantine/core";
import BattleModeCard from "../components/battleModeCard";
import "../styles/BattleListPage.css";

const modes = ["easy", "medium", "hard", "hell"];

function BattleListPage() {
  const [onModes, setOnModes] = useState(new Set());
  const [loadingModes, setLoadingModes] = useState(new Set());
  const [searching, setSearching] = useState(false);
  const [prevOnModes, setPrevOnModes] = useState(new Set());

  const toggleMode = (mode) => {
    setOnModes((prev) => {
      const next = new Set(prev);
      if (next.has(mode)) next.delete(mode);
      else next.add(mode);
      return next;
    });
  };

  const handleSearch = () => {
    if (onModes.size === 0) return;
    setPrevOnModes(new Set(onModes));
    setLoadingModes(new Set(onModes));
    setSearching(true);
  };

  const handleCancel = () => {
    setOnModes(new Set(prevOnModes));
    setLoadingModes(new Set());
    setSearching(false);
  };

  return (
    <div className="battle-page">
      <h1 className="battle-title">Battle</h1>

      <div className="battle-cards">
        {modes.map((mode) => (
          <BattleModeCard
            key={mode}
            img={`/images/${mode}.png`}
            mode={mode}
            checked={onModes.has(mode)}
            loading={loadingModes.has(mode)}
            disabled={searching && !onModes.has(mode)}
            onToggle={() => toggleMode(mode)}
          />
        ))}
      </div>

      <div className="battle-actions">
        {searching ? (
          <Button className="search-btn" color="red" size="md" onClick={handleCancel}>
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
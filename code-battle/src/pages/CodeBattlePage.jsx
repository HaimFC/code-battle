import { useEffect, useState } from "react";
import { getMockBattleByID } from "../utils/supabaseQueries";
import { useMockAuth } from "../auth/AuthProvider";

export default function CodeBattlePage({
  battleID,
  handleFinishCoding,
  handleForfeitBattle,
}) {
  const [data, setData] = useState(null);
  const { activeUser } = useMockAuth();
  useEffect(() => {
    async function getData() {
      const res = getMockBattleByID(battleID);
      setData(res);
    }
    getData();

    return () => {
      () => handleForfeitBattle(activeUser, battleID);
    };
  }, []);

  return (
    <>
      {battleID ? "Code Battle!" : "Practice Coding"}
      {data && data?.question}
      <button onClick={handleFinishCoding}>Submit</button>
      <button onClick={handleForfeitBattle}>
        {battleID ? "Forfeit Battle" : "Quit"}
      </button>
    </>
  );
}

import { useEffect, useState } from "react";
import { getMockBattleByID } from "../utils/supabaseQueries";

export default function CodeBattlePage({ battleID, handleFinishCoding }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    async function getData() {
      const res = getMockBattleByID(battleID);
      setData(res);
    }
    getData();
  }, []);

  return (
    <>
      code battle
      <button onClick={handleFinishCoding}>Submit</button>
    </>
  );
}

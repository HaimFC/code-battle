import { useEffect, useState } from "react";
import { getMockBattleByID } from "../utils/supabaseQueries";
import { useMockAuth } from "../auth/AuthProvider";
import { Button } from "@mantine/core";

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
      <Button onClick={() => handleFinishCoding(activeUser)}>Submit</Button>
      <Button onClick={() => handleForfeitBattle(activeUser, battleID)}>
        {battleID ? "Forfeit Battle" : "Quit"}
      </Button>
    </>
  );
}

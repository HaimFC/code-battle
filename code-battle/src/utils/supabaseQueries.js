import { useMockAuth } from "../auth/AuthProvider";

export async function getMockLeaderboard() {
  const data = [
    { displayName: "john", elo: 1000 },
    { displayName: "steve", elo: 900 },
    { displayName: "madison", elo: 800 },
    { displayName: "adam", elo: 700 },
    { displayName: "bertrude", elo: 600 },
  ];

  return data;
}
export async function getOpponent(difficulty) {
  return { displayName: "alex", elo: 650 };
}

const QUESTIONS = { Easy: 13, Medium: 10, Hard: 25 };

async function getMockRandomQuestionByDifficulty(difficulty) {
  return "two sum";
}

export async function postMockBattle(opponent, difficulty) {
  // const { activeUser } = useMockAuth();
  // if (!(difficulty in QUESTIONS)) {
  //   throw new Error("difficulty not found");
  // }

  // const question = await getMockRandomQuestionByDifficulty();
  // const post = { userA: activeUser, userB: opponent, question };
  return 3;
}

export async function getMockBattleByID(battleID) {
  return {
    userA: { displayName: "john" },
    userB: { displayName: "alex" },
    question: "two sum",
  };
}

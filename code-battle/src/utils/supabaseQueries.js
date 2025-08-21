import { useMockAuth } from "../auth/AuthProvider";

export async function getMockLeaderboard() {
  const data = [
    { displayName: "john", score: 1000 },
    { displayName: "steve", score: 900 },
    { displayName: "madison", score: 800 },
    { displayName: "adam", score: 700 },
    { displayName: "bertrude", score: 600 },
  ];

  return data;
}
export async function getMockOpponent(difficulty) {
  return { displayName: "alex", score: 650 };
}

const QUESTIONS = { Easy: 13, Medium: 10, Hard: 25 };

async function getMockRandomQuestionByDifficulty(difficulty) {
  return "two sum";
}

export async function postMockBattle(activeUser, opponent, difficulty) {
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

export async function forfeitMockBattle(battleID) {
  const success = true;
  return success;
}

export async function updateMockScore(activeUser, points) {
  return activeUser.score + points;
}

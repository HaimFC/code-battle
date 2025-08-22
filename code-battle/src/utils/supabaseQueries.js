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

async function getMockRandomQuestionByDifficulty(difficulty) {
  //  const QUESTIONS = { Easy: 13, Medium: 10, Hard: 25 };
  // if (!(difficulty in QUESTIONS)) {
  //   throw new Error("difficulty not found");
  // }
  return "two sum";
}

export async function postMockBattle(activeUser, difficulty) {
  const question = await getMockRandomQuestionByDifficulty(difficulty);
  const post = { userA: activeUser, question };
  return 3;
}

export async function joinMockBattle(difficulty) {
  console.log("no battle found for difficulty");
}

export async function getMockBattleByID(battleID) {
  return {
    userA: { displayName: "john" },
    userB: { displayName: "alex" },
    question: "two sum",
  };
}

export async function forfeitMockBattle(activeUser, battleID) {
  const success = true;
  if (!success) {
    throw new Error("could not forfeit battle");
  }
  const newScore = await updateMockScore(activeUser, -100);
  console.log(`new score is: ${newScore}`);
  return success;
}

export async function updateMockScore(activeUser, points) {
  return activeUser.score + points;
}

export async function getProfile(activeUser) {
  const data = { user_id: 1, displayName: "john", score: 9001 };
  return data;
}

export async function getActiveBattle(activeUser) {
  const battleID = 3;
}

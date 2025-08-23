import { supabase } from "../api/supabaseClient";

const DIFF_MAP = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  hell: "Hell",
};

export async function addProfileScoreOnce(userId, delta, key) {
  const { data, error } = await supabase.rpc("add_profile_score_once", {
    p_user: userId,
    p_delta: delta,
    p_key: key
  });
  if (error) throw error;
  return data === true;
}

export async function getQuestionWithTests(questionId) {
  const { data, error } = await supabase
    .from("questions")
    .select("id,title,description,InitialValue,tests")
    .eq("id", questionId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("question not found");
  return {
    question: {
      id: data.id,
      title: data.title || "",
      description: data.description || "",
      initialValue: data.InitialValue || ""
    },
    tests: Array.isArray(data.tests) ? data.tests : []
  };
}

export async function getLeaderboardProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, first_name, last_name, score, rank")
    .order("rank", { ascending: false })
    .order("score", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => {
    const fullName = [p.first_name, p.last_name].filter(Boolean).join(" ");
    return {
      ...p,
      name: p.display_name || fullName || "Anonymous",
      score: p.score ?? 0,
      rank: p.rank ?? 0,
    };
  });
}

export async function getRandomQuestionByDifficulty(diffKey) {
  const difficulty = DIFF_MAP[String(diffKey).toLowerCase()] ?? String(diffKey);

  const { data, error } = await supabase
    .from("questions")
    .select(
      "id,title,description,initialValue:InitialValue,difficulty,Type,categories,TimeComplexity,SpaceComplexity"
    )
    .eq("Type", "Practice")
    .eq("difficulty", difficulty);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`No questions found for difficulty "${difficulty}"`);
  }

  const random = data[Math.floor(Math.random() * data.length)];
  return {
    id: random.id,
    title: random.title ?? "",
    description: random.description ?? "",
    initialValue: random.initialValue ?? "",
    difficulty: random.difficulty ?? difficulty,
  };
}

export async function enqueueAndMatch(userId, modesSet) {
  const diffs = Array.from(modesSet);

  const { data, error } = await supabase.rpc("enqueue_and_match", {
    p_user: userId,
    p_diffs: diffs,
  });
  if (error) throw error;

  if (Array.isArray(data) && data.length > 0) {
    const row = data[0];
    return {
      battleId: row.battle_id,
      opponentId: row.opponent,
      difficulty: row.match_difficulty,
      questionId: row.question_id,
    };
  }
  return null;
}

export async function leaveQueue(userId) {
  const { error } = await supabase.rpc("leave_queue", { p_user: userId });
  if (error) throw error;
}

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

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, first_name, last_name, phone, score, rank, wins, losses, updated_at, created_at"
    )
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getActiveBattle(activeUser) {
  const battleID = 3;
}

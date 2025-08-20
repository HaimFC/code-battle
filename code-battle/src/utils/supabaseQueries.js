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

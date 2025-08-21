export default function LeaderboardEntry({ displayName, score, rank }) {
  return (
    <tr>
      <td>{displayName}</td>
      <td>{score}</td>
      <td>{rank + 1}</td>
    </tr>
  );
}

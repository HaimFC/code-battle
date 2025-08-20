export default function LeaderboardEntry({ displayName, elo, rank }) {
  return (
    <tr>
      <td>{displayName}</td>
      <td>{elo}</td>
      <td>{rank + 1}</td>
    </tr>
  );
}

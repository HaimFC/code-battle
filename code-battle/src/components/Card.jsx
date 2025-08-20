export default function Card({ text, handleClick }) {
  return (
    <p className="card" onClick={() => handleClick(text)}>
      {text}
    </p>
  );
}

import { useNavigate } from "react-router";

export default function Card({ text, to }) {
  const navigate = useNavigate();

  return (
    <p className="card" onClick={() => navigate(to)}>
      {text}
    </p>
  );
}

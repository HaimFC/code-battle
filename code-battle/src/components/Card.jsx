export default function Card({ text, handleClick, clicked, setClicked }) {
  return (
    <p
      className={text === clicked ? "card selected" : "card unselected"}
      onClick={() => {
        handleClick(text);
        setClicked(text);
      }}
    >
      {text}
    </p>
  );
}

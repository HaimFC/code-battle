export default function Card({ text, handleClick, selected }) {
  return (
    <p
      className={text === selected ? "card selected" : "card unselected"}
      onClick={() => {
        handleClick(text);
      }}
    >
      {text}
    </p>
  );
}

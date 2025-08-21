import Card from "./Card";

export default function Cards({ cards, handleClick, selected }) {
  return (
    <>
      {cards &&
        cards?.map(({ text }, index) => (
          <Card
            key={index}
            text={text}
            handleClick={handleClick}
            selected={selected}
          />
        ))}
    </>
  );
}

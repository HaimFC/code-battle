import Card from "./Card";

export default function Cards({ cards }) {
  return (
    <>
      {cards &&
        cards?.map(({ text, to }, index) => (
          <Card key={index} text={text} to={to} />
        ))}
    </>
  );
}

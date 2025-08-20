import Card from "./Card";

export default function Cards({ cards }) {
  return (
    <>
      {cards &&
        cards?.map(({ text }, index) => <Card key={index} text={text} />)}
    </>
  );
}

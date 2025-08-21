import { useState } from "react";
import Card from "./Card";

export default function Cards({ cards, handleClick }) {
  const [clicked, setClicked] = useState("");
  return (
    <>
      {cards &&
        cards?.map(({ text }, index) => (
          <Card
            key={index}
            text={text}
            handleClick={handleClick}
            clicked={clicked}
            setClicked={setClicked}
          />
        ))}
    </>
  );
}

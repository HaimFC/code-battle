import Card from "./Card";
import { Group } from "@mantine/core";

export default function Cards({ cards, handleClick, selected }) {
  return (
    <Group grow="true">
      {cards &&
        cards?.map(({ text }, index) => (
          <Card
            key={index}
            text={text}
            handleClick={handleClick}
            selected={selected}
          />
        ))}
    </Group>
  );
}

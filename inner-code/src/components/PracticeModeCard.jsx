import { Card, Image, Text, Button, Stack } from "@mantine/core";

function PracticeModeCard({ img, diff, onClick }) {
  const handleClick = () => onClick?.();

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      className="battle-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      style={{ cursor: "pointer" }}
    >
      <Card.Section>
        <Image src={img} h={160} alt={diff} />
      </Card.Section>

      <Stack align="center" mt="md" gap="xs">
        <Text fw={700} className="mode-text">
          {diff}
        </Text>

        <Button
          variant="filled"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label={`Enter ${diff}`}
        >
          Enter
        </Button>
      </Stack>
    </Card>
  );
}

export default PracticeModeCard;

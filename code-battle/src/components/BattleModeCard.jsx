import { Card, Image, Text, Switch, Stack, Loader } from "@mantine/core";

function BattleModeCard({ img, mode, checked, onToggle, loading, disabled }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="battle-card">
      <Card.Section>
        <Image src={img} height={160} alt={mode} />
      </Card.Section>

      <Stack align="center" mt="md" gap="xs">
        <Text fw={700} className="mode-text">
          {mode}
        </Text>

        {loading && checked ? (
          <Loader color="blue" />
        ) : (
          <Switch
            checked={checked}
            onChange={onToggle}
            size="md"
            disabled={disabled}
            className="mode-switch"
          />
        )}
      </Stack>
    </Card>
  );
}

export default BattleModeCard;

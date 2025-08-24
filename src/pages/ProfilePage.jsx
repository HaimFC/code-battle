// User profile (stats, past battles).
import { useEffect, useState, useMemo } from "react";
import { useAuthContext } from "../context/AuthContext";
import { getProfile } from "../utils/supabaseQueries";
import {
  Card,
  Group,
  Stack,
  Text,
  Divider,
  Button,
  Rating,
  Skeleton,
  PasswordInput,
  Grid,
  Badge,
  Alert,
  Flex,
  TextInput,
  ActionIcon,
  Tooltip,
  Popover,
} from "@mantine/core";
import { supabase } from "../api/supabaseClient";
import ProfileImage from "../components/ProfileImage";
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react";

const COLORS = ["blue","cyan","grape","green","indigo","lime","orange","pink","purple","red","teal","violet","yellow"];

function pickColor(seed = "") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 0x7fffffff;
  return COLORS[h % COLORS.length];
}

export default function ProfilePage() {
  const { user } = useAuthContext(); // user.id = auth.users UUID
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // password change state
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwMsg, setPwMsg] = useState(null);

  // inline edit state + values
  const [openNick, setOpenNick] = useState(false);
  const [openName, setOpenName] = useState(false);
  const [openPhone, setOpenPhone] = useState(false);

  const [nickValue, setNickValue] = useState("");
  const [firstValue, setFirstValue] = useState("");
  const [lastValue, setLastValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");

  const [saving, setSaving] = useState(false);
  const [editMsg, setEditMsg] = useState(null);

  const fullName = useMemo(() => {
    if (!profile) return "";
    const byNames = [profile.first_name, profile.last_name].filter(Boolean).join(" ");
    return byNames;
  }, [profile]);

  const displayTitle = useMemo(() => {
    return profile?.display_name || fullName || (user?.email?.split("@")[0] ?? "Your Profile");
  }, [profile?.display_name, fullName, user?.email]);

  const avatarColor = useMemo(() => pickColor(user?.id || user?.email || "fallback"), [user]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const data = await getProfile(user.id);
        setProfile(data);
        setNickValue(data?.display_name || "");
        setFirstValue(data?.first_name || "");
        setLastValue(data?.last_name || "");
        setPhoneValue(data?.phone || "");
      } catch (e) {
        console.error("load profile failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  async function handleChangePassword() {
    setPwMsg(null);
    if (pw1.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    if (pw1 !== pw2) {
      setPwMsg({ type: "error", text: "Passwords do not match" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: pw1 });
    if (error) {
      setPwMsg({ type: "error", text: error.message || "Failed to update password" });
    } else {
      setPwMsg({ type: "success", text: "Password updated" });
      setPw1("");
      setPw2("");
    }
  }

  function validPhone(v) {
    if (!v) return true; // optional
    return /^\+?[0-9\s\-()]{6,}$/.test(v);
  }

  async function saveFields(fields, metadata = {}) {
    setEditMsg(null);
    setSaving(true);
    try {
      const { error: upErr } = await supabase
        .from("profiles")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (upErr) throw upErr;

      if (Object.keys(metadata).length > 0) {
        const { error: metaErr } = await supabase.auth.updateUser({ data: metadata });
        if (metaErr) console.warn("update auth metadata failed:", metaErr);
      }

      setProfile((p) => ({ ...p, ...fields }));
      setEditMsg({ type: "success", text: "Saved successfully" });
      setOpenNick(false);
      setOpenName(false);
      setOpenPhone(false);
    } catch (e) {
      console.error(e);
      setEditMsg({ type: "error", text: e?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function saveNickname() {
    if (!nickValue || nickValue.trim().length < 2) {
      setEditMsg({ type: "error", text: "Nickname must be at least 2 characters" });
      return;
    }
    await saveFields(
      { display_name: nickValue.trim() },
      { display_name: nickValue.trim() }
    );
  }

  async function saveFullName() {
    await saveFields(
      { first_name: firstValue.trim() || null, last_name: lastValue.trim() || null },
      { first_name: firstValue.trim() || null, last_name: lastValue.trim() || null }
    );
  }

  async function savePhone() {
    if (!validPhone(phoneValue)) {
      setEditMsg({ type: "error", text: "Invalid phone number" });
      return;
    }
    await saveFields(
      { phone: phoneValue || null },
      { phone: phoneValue || null }
    );
  }

  return (
    <Card radius="lg" padding="lg" withBorder style={{ maxWidth: 720, margin: "0 auto" }}>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group>
            <ProfileImage name={displayTitle} color={avatarColor} />
            <Stack gap={2}>
              <Group gap="xs" align="center">
                <Text size="lg" fw={700}>
                  {displayTitle}
                </Text>

                {/* Edit Nickname (title) */}
                <Popover
                  opened={openNick}
                  onChange={setOpenNick}
                  position="bottom-start"
                  withArrow
                  shadow="md"
                >
                  <Popover.Target>
                    <Tooltip label="Edit nickname">
                      <ActionIcon
                        variant="subtle"
                        aria-label="Edit nickname"
                        onClick={() => setOpenNick((o) => !o)}
                      >
                        <IconPencil size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Stack gap="xs" style={{ minWidth: 240 }}>
                      <TextInput
                        label="Nickname"
                        placeholder="Enter nickname"
                        value={nickValue}
                        onChange={(e) => setNickValue(e.currentTarget.value)}
                      />
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon
                          variant="light"
                          color="green"
                          onClick={saveNickname}
                          disabled={saving}
                          aria-label="Save nickname"
                        >
                          <IconCheck size={18} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            setNickValue(profile?.display_name || "");
                            setOpenNick(false);
                          }}
                          disabled={saving}
                          aria-label="Cancel nickname edit"
                        >
                          <IconX size={18} />
                        </ActionIcon>
                      </Group>
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
              </Group>

              {user?.email && (
                <Text size="sm" c="dimmed">
                  {user.email}
                </Text>
              )}
            </Stack>
          </Group>

          <Group>
            <Badge variant="light" size="lg">
              Score: {profile?.score ?? 0}
            </Badge>
          </Group>
        </Group>

        <Divider />

        {/* Details */}
        {loading ? (
          <Stack>
            <Skeleton height={18} />
            <Skeleton height={18} />
            <Skeleton height={18} />
          </Stack>
        ) : (
          <Grid gutter="md">
            {/* Full name (read-only with edit) */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap={6}>
                <Group justify="center" align="center" gap="xs">
                  <Text fw={600}>Full name</Text>

                  {/* Edit Full name */}
                  <Popover
                    opened={openName}
                    onChange={setOpenName}
                    position="bottom-end"
                    withArrow
                    shadow="md"
                  >
                    <Popover.Target>
                      <Tooltip label="Edit full name">
                        <ActionIcon
                          variant="subtle"
                          aria-label="Edit full name"
                          onClick={() => setOpenName((o) => !o)}
                        >
                          <IconPencil size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Stack gap="xs" style={{ minWidth: 280 }}>
                        <Group grow>
                          <TextInput
                            label="First name"
                            placeholder="First name"
                            value={firstValue}
                            onChange={(e) => setFirstValue(e.currentTarget.value)}
                          />
                          <TextInput
                            label="Last name"
                            placeholder="Last name"
                            value={lastValue}
                            onChange={(e) => setLastValue(e.currentTarget.value)}
                          />
                        </Group>
                        <Group gap="xs" justify="flex-end">
                          <ActionIcon
                            variant="light"
                            color="green"
                            onClick={saveFullName}
                            disabled={saving}
                            aria-label="Save full name"
                          >
                            <IconCheck size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => {
                              setFirstValue(profile?.first_name || "");
                              setLastValue(profile?.last_name || "");
                              setOpenName(false);
                            }}
                            disabled={saving}
                            aria-label="Cancel full name edit"
                          >
                            <IconX size={18} />
                          </ActionIcon>
                        </Group>
                      </Stack>
                    </Popover.Dropdown>
                  </Popover>
                </Group>

                <Text c="dimmed">{fullName || "—"}</Text>
              </Stack>
            </Grid.Col>

            {/* Phone (read-only with edit) */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap={6}>
                <Group justify="center" align="center" gap="xs">
                  <Text fw={600}>Phone</Text>

                  {/* Edit Phone */}
                  <Popover
                    opened={openPhone}
                    onChange={setOpenPhone}
                    position="bottom-end"
                    withArrow
                    shadow="md"
                  >
                    <Popover.Target>
                      <Tooltip label="Edit phone">
                        <ActionIcon
                          variant="subtle"
                          aria-label="Edit phone"
                          onClick={() => setOpenPhone((o) => !o)}
                        >
                          <IconPencil size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Stack gap="xs" style={{ minWidth: 240 }}>
                        <TextInput
                          label="Phone"
                          placeholder="Enter phone"
                          value={phoneValue}
                          onChange={(e) => setPhoneValue(e.currentTarget.value)}
                        />
                        <Group gap="xs" justify="flex-end">
                          <ActionIcon
                            variant="light"
                            color="green"
                            onClick={savePhone}
                            disabled={saving}
                            aria-label="Save phone"
                          >
                            <IconCheck size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => {
                              setPhoneValue(profile?.phone || "");
                              setOpenPhone(false);
                            }}
                            disabled={saving}
                            aria-label="Cancel phone edit"
                          >
                            <IconX size={18} />
                          </ActionIcon>
                        </Group>
                      </Stack>
                    </Popover.Dropdown>
                  </Popover>
                </Group>

                <Text c="dimmed">{profile?.phone || "—"}</Text>
              </Stack>
            </Grid.Col>

            {/* Rank (read-only, centered) */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Flex justify="center" align="center">
                <Stack gap={6} align="center">
                  <Text fw={600}>Rank</Text>
                  <Rating value={profile?.rank ?? 0} readOnly />
                </Stack>
              </Flex>
            </Grid.Col>

            {/* Wins / Losses */}
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap={6}>
                <Text fw={600}>Wins / Losses</Text>
                <Text c="dimmed">{(profile?.wins ?? 0) + " / " + (profile?.losses ?? 0)}</Text>
              </Stack>
            </Grid.Col>
          </Grid>
        )}

        {editMsg && (
          <Alert color={editMsg.type === "error" ? "red" : "green"}>{editMsg.text}</Alert>
        )}

        <Divider />

        {/* Change Password */}
        <Stack gap="xs">
          <Text fw={600}>Change password</Text>
          <Group align="flex-end" wrap="wrap">
            <PasswordInput
              label="New password"
              placeholder="Enter new password"
              value={pw1}
              onChange={(e) => setPw1(e.currentTarget.value)}
              w={260}
            />
            <PasswordInput
              label="Confirm password"
              placeholder="Re-enter password"
              value={pw2}
              onChange={(e) => setPw2(e.currentTarget.value)}
              w={260}
            />
            <Button onClick={handleChangePassword}>Update</Button>
          </Group>
          {pwMsg && (
            <Alert color={pwMsg.type === "error" ? "red" : "green"}>{pwMsg.text}</Alert>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

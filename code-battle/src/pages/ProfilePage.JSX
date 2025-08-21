// User profile (stats, past battles).
import { useEffect, useState } from "react";
import { useMockAuth } from "../auth/AuthProvider";
import { getProfile } from "../utils/supabaseQueries";
import { Text } from "@mantine/core";

export default function ProfilePage() {
  const { activeUser } = useMockAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function getData() {
      const user = await getProfile(activeUser);
      setProfile(user);
    }
    getData();
  }, []);

  return (
    <>
      <Text>{activeUser.displayName}'s Profile</Text>
      {profile && <Text>Your score is: {profile.score}</Text>}
    </>
  );
}

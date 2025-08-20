// Jonah

import { useMockAuth } from "../auth/AuthProvider";

// TODO: Use Mantine Form to pass values / UseState
// TODO: Use supabase handleLogin function

// Login form (uses Supabase Auth).

export default function LoginPage() {
  const { handleLogin } = useMockAuth();
  return (
    <>
      <input type="text" placeholder="enter email" />
      <input type="text" placeholder="enter password" />
      <button onClick={handleLogin}>Log In</button>
    </>
  );
}

// Jonah

// TODO: Use Mantine Form to pass values / UseState
// TODO: Use supabase handleLogin function

// Login form (uses Supabase Auth).

function handleLoginMock(email, password) {
  console.log("login button pressed");
}

export default function LoginPage() {
  return (
    <>
      <input type="text" placeholder="enter email" />
      <input type="text" placeholder="enter password" />
      <button onClick={handleLoginMock}>Log In</button>
    </>
  );
}

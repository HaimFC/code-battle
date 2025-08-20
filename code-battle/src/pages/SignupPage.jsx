// Jonah

// Signup form.

function mockSignUp(user) {
  console.log("signing up user");
}

export default function SignUpPage() {
  return (
    <>
      <input type="text" placeholder="email" />
      <input type="text" placeholder="password" />
      <button onClick={mockSignUp}>Sign up</button>
    </>
  );
}

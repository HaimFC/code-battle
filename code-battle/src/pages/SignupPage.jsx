import { useMockAuth } from "../auth/AuthProvider";
import { Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";

// TODO: Use supabase handleLogin function

// Login form (uses Supabase Auth).
export default function LoginPage() {
  const { handleSignUp } = useMockAuth();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      activeUser: (value) =>
        /^[a-zA-Z].{1,}$/.test(value) ? null : "Invalid userName",
    },
    password: (value) =>
      /^[a-zA-Z].{1,}$/.test(value) ? null : "Invalid password",
  });

  return (
    <form
      style={{ display: "flex", marginTop: "0.25rem" }}
      onSubmit={form.onSubmit((values) =>
        handleSignUp(values.email, values.password)
      )}
    >
      <TextInput
        w={200}
        withAsterisk
        placeholder="Enter email"
        key={form.key("email")}
        {...form.getInputProps("email")}
      />
      <TextInput
        w={200}
        withAsterisk
        placeholder="Enter password"
        key={form.key("password")}
        {...form.getInputProps("password")}
      />
      <Button
        style={{ alignSelf: "flex-start", marginLeft: "0.1rem" }}
        type="submit"
      >
        Submit
      </Button>
    </form>
  );
}

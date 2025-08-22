import { useMockAuth } from "../auth/AuthProvider";
import { Button, TextInput, Group } from "@mantine/core";
import { useForm } from "@mantine/form";

// TODO: Use supabase handleLogin function

// Login form (uses Supabase Auth).
export default function LoginPage() {
  const { handleLogin } = useMockAuth();

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
        handleLogin(values.email, values.password)
      )}
    >
      <Group>
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
      </Group>

      <Button
        style={{ alignSelf: "flex-start", marginLeft: "0.1rem" }}
        type="submit"
      >
        Submit
      </Button>
    </form>
  );
}

import { useAuthContext } from "../context/AuthContext";
import { Button, TextInput, PasswordInput, Group } from "@mantine/core";
import { useForm } from "@mantine/form";

export default function LoginPage() {
  const { signIn } = useAuthContext();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email",
      password: (value) =>
        value.length >= 6 ? null : "Password too short",
    },
  });

  return (
    <form
      style={{ display: "flex", marginTop: "0.25rem" }}
      onSubmit={form.onSubmit(async (values) => {
        try {
          await signIn(values.email, values.password);
          alert("Logged in successfully");
        } catch (err) {
          alert("Error " + err.message);
        }
      })}
    >
      <Group>
        <TextInput
          w={200}
          withAsterisk
          placeholder="Enter email"
          key={form.key("email")}
          {...form.getInputProps("email")}
        />
        <PasswordInput
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

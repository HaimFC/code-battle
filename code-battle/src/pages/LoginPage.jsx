import { useAuthContext } from "../context/AuthContext";
import {
  Button,
  TextInput,
  PasswordInput,
  Stack,
  Container,
  Card,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const { user, signIn } = useAuthContext();
  const navigate = useNavigate();

  if (user) {
    navigate("/code-battle/");
  }

  const form = useForm({
    mode: "uncontrolled",
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length >= 6 ? null : "Password too short"),
    },
  });

  return (
    <Container size={"390px"}>
      <Card radius={"10px"}>
        <form
          style={{ display: "flex", marginTop: "0.25rem" }}
          onSubmit={form.onSubmit(async (values) => {
            try {
              await signIn(values.email, values.password);
              navigate("/code-battle/");
            } catch (err) {
              alert("Error: " + err.message);
            }
          })}
        >
          <Stack>
            <TextInput
              w={330}
              withAsterisk
              placeholder="Enter email"
              key={form.key("email")}
              {...form.getInputProps("email")}
            />
            <PasswordInput
              w={330}
              withAsterisk
              placeholder="Enter password"
              key={form.key("password")}
              {...form.getInputProps("password")}
            />

            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}

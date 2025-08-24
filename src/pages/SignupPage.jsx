// pages/SignUpPage.jsx
import { useAuthContext } from "../context/AuthContext";
import {
  Button,
  TextInput,
  PasswordInput,
  Card,
  Container,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router";

export default function SignUpPage() {
  const { user, signUp } = useAuthContext();
  const navigate = useNavigate();

  if (user) {
    navigate("/code-battle/");
  }

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
      displayName: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Wrong mail"),
      password: (v) => (v.length >= 6 ? null : "Password too short"),
      displayName: (v) => (v.trim().length >= 2 ? null : "Nickname too short"),
      firstName: (v) => (v ? null : null),
      lastName: (v) => (v ? null : null),
      phone: (v) =>
        v && !/^\+?[0-9\s\-()]{6,}$/.test(v) ? "Invalid phone" : null,
    },
  });

  return (
    <Container size={"390px"}>
      <Card radius={"10px"}>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            maxWidth: 360,
          }}
          onSubmit={form.onSubmit(async (values) => {
            try {
              await signUp({
                email: values.email,
                password: values.password,
                displayName: values.displayName,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
              });
              alert("Check your email to register");
              navigate("/code-battle/login");
            } catch (err) {
              alert("Error: " + (err?.message || "Unknown"));
            }
          })}
        >
          <Stack>
            <TextInput
              withAsterisk
              placeholder="Email"
              key={form.key("email")}
              {...form.getInputProps("email")}
            />
            <PasswordInput
              withAsterisk
              placeholder="Password"
              key={form.key("password")}
              {...form.getInputProps("password")}
            />
            <TextInput
              withAsterisk
              placeholder="Nickname"
              key={form.key("displayName")}
              {...form.getInputProps("displayName")}
            />
            <TextInput
              placeholder="First name"
              key={form.key("firstName")}
              {...form.getInputProps("firstName")}
            />
            <TextInput
              placeholder="Last name"
              key={form.key("lastName")}
              {...form.getInputProps("lastName")}
            />
            <TextInput
              placeholder="Phone"
              key={form.key("phone")}
              {...form.getInputProps("phone")}
            />
          </Stack>
          <Button type="submit">Create Account</Button>
        </form>
      </Card>
    </Container>
  );
}

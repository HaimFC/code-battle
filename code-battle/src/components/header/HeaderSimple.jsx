import { Container, Group, Button } from "@mantine/core";
import { NavLink, useLocation } from "react-router";
import { useAuthContext } from "../../context/AuthContext";
import classes from "./HeaderSimple.module.css";

const links = {
  guest: [
    { to: "/", text: "Home" },
    { to: "/leaderboard", text: "Leaderboard" },
    { to: "/help", text: "Help" },
    { to: "/login", text: "Log in" },
    { to: "/signup", text: "Sign Up" },
  ],
  user: [
    { to: "/", text: "Home" },
    { to: "/leaderboard", text: "Leaderboard" },
    { to: "/help", text: "Help" },
    { to: "/profile", text: "My Profile" },
  ],
};

export function HeaderSimple() {
  const { user, signOut } = useAuthContext();
  const { pathname } = useLocation();

  const mode = user ? "user" : "guest";

  const items = links[mode].map((link) => (
    <NavLink
      key={link.to}
      to={link.to}
      className={({ isActive }) =>
        `${classes.link} ${isActive ? classes.active ?? "" : ""}`
      }
      end={link.to === "/"}
    >
      {link.text}
    </NavLink>
  ));

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>

        <Group>
          {user && (
            <Button color="red" onClick={signOut}>
              Log Out
            </Button>
          )}
        </Group>
      </Container>
    </header>
  );
}

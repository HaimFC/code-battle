import { useState } from "react";
import { Container, Group, Button } from "@mantine/core";
import classes from "./HeaderSimple.module.css";
import { useMockAuth } from "../../auth/AuthProvider";
import { NavLink, useLocation } from "react-router";

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
  const { activeUser, handleLogout } = useMockAuth();
  const userOrGuest = activeUser ? "user" : "guest";

  const { pathname } = useLocation();
  const override = !(pathname in links[userOrGuest]);

  const [active, setActive] = useState(override ? "/" : pathname);

  const items = links[userOrGuest].map((link) => (
    <NavLink
      key={link.text}
      href={link.link}
      className={classes.link}
      data-active={active === link.to || undefined}
      onClick={() => {
        setActive(link.to);
      }}
      to={link.to}
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
          {activeUser && (
            <Button color="red" onClick={handleLogout}>
              Log Out
            </Button>
          )}
        </Group>
      </Container>
    </header>
  );
}

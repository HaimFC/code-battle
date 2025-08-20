import { Link } from "react-router";
import { useMockAuth } from "../auth/AuthProvider";

const Navigation = ({ links }) => {
  const { activeUser, handleLogout } = useMockAuth();
  const userOrGuest = activeUser ? "user" : "guest";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        minHeight: "60px",
        padding: "0 1rem",
        boxSizing: "border-box",
        backgroundColor: "lightgrey",
      }}
    >
      <div style={{ display: "flex", gap: "1rem" }}>
        {links[userOrGuest]?.map(({ to, text }) => (
          <Link key={to} to={to}>
            {text}
          </Link>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-end",
        }}
      >
        <p>Welcome {activeUser?.displayName ?? "guest"}</p>
        {activeUser && <button onClick={handleLogout}>Log Out</button>}
      </div>
    </div>
  );
};
export default Navigation;

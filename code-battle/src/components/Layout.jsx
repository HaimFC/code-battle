import { HeaderSimple } from "./header/HeaderSimple";
import Navigation from "./Navigation";

const Layout = ({ children }) => {
  return (
    <>
      <HeaderSimple />
      <main>{children}</main>
    </>
  );
};

export default Layout;

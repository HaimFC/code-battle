import Navigation from "./Navigation";

const Layout = ({ links, children }) => {
  return (
    <>
      <Navigation links={links} />
      <main>{children}</main>
    </>
  );
};

export default Layout;

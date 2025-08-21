import Navigation from "./Navigation";

const Layout = ({ links, hide, children }) => {
  return (
    <>
      <Navigation links={links} hide={hide} />
      <main>{children}</main>
    </>
  );
};

export default Layout;

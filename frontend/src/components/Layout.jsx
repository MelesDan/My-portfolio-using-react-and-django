import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <div className="background-orb orb-left" />
      <div className="background-orb orb-right" />
      <Navbar />
      <main className="page-shell">{children}</main>
      <footer className="site-footer">
        <p>Single-vendor electronics commerce for the Ethiopian market.</p>
        <p>Catalog, recommendations, cart, sandbox checkout, and admin analytics.</p>
      </footer>
    </div>
  );
}

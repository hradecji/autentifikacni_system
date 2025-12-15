export default function Shell({ title, children }) {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <p style={{ marginTop: 8, color: "#444" }}>
          Minimal UI on purpose. Focus is authentication flow + security controls.
        </p>
        <hr />
      </header>
      <main>{children}</main>
      <footer style={{ marginTop: 40, color: "#666", fontSize: 12 }}>
        <hr />
        <div>Key risks + mitigations are documented in <code>docs/SECURITY_MAP.md</code>.</div>
      </footer>
    </div>
  );
}

import { useSession, signIn } from "next-auth/react";
import Shell from "../components/Shell";
import { keycloakLogout } from "../lib/keycloakLogout";

export default function Home() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthed = !!session?.user;

  return (
    <Shell title="Autentifikacni System (Next.js + Keycloak)">
      <section style={{ marginBottom: 24 }}>
        <h2>Status</h2>
        {isLoading ? (
          <p>Loading session…</p>
        ) : isAuthed ? (
          <>
            <p>
              Signed in as <b>{session.user?.email || session.user?.name || session.user?.sub || "user"}</b>
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/dashboard">Go to dashboard</a>
              <button
                onClick={() => keycloakLogout({ idToken: session.idToken })}
                style={{ padding: "8px 12px" }}
              >
                Logout (local + Keycloak)
              </button>
            </div>
          </>
        ) : (
          <>
            <p>Not signed in.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
                style={{ padding: "8px 12px" }}
              >
                Login
              </button>

              <button
                onClick={() =>
                  // Keycloak supports initiating registration via prompt=create (Keycloak 26.1+)
                  signIn("keycloak", { callbackUrl: "/dashboard" }, { prompt: "create" })
                }
                style={{ padding: "8px 12px" }}
              >
                Register
              </button>
            </div>
          </>
        )}
      </section>

      <section>
        <h2>What to test</h2>
        <ol>
          <li>Click <b>Register</b> → create account in Keycloak UI.</li>
          <li>After first login, you should be forced to <b>configure OTP</b> (MFA enrollment).</li>
          <li>Logout, then Login again → you should be prompted for <b>OTP code</b>.</li>
        </ol>

        <p style={{ color: "#444" }}>
          Note: Registration/login UI is intentionally delegated to Keycloak for security (passwords and MFA secrets
          never touch this Next.js app). The Next.js page is a minimal “entry point” that triggers the right OIDC flows.
        </p>
      </section>
    </Shell>
  );
}

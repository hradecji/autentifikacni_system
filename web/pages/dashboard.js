import { getSession } from "next-auth/react";
import Shell from "../components/Shell";
import { useSession } from "next-auth/react";
import { keycloakLogout } from "../lib/keycloakLogout";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <Shell title="Dashboard (protected)">
      <p>
        You are authenticated. This route is protected by <code>getServerSideProps</code>.
      </p>

      <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="/">Home</a>
        <button
          onClick={() => keycloakLogout({ idToken: session?.idToken })}
          style={{ padding: "8px 12px" }}
        >
          Logout (local + Keycloak)
        </button>
      </div>

      <h2 style={{ marginTop: 24 }}>Session details</h2>
      <pre style={{ padding: 12, background: "#f6f6f6", overflow: "auto" }}>
{JSON.stringify(
  {
    user: session?.user,
    expires: session?.expires,
    // Tokens are shown only for demo transparency; in a real app you would not render them.
    accessTokenPreview: session?.accessToken ? String(session.accessToken).slice(0, 20) + "…" : null,
    hasIdToken: !!session?.idToken,
    expiresAt: session?.expiresAt ?? null,
  },
  null,
  2
)}
      </pre>
    </Shell>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

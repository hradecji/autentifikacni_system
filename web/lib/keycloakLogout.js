import { signOut } from "next-auth/react";

/**
 * "Global" logout:
 * 1) Clears the NextAuth session cookie
 * 2) Redirects to Keycloak RP-initiated logout endpoint (ends Keycloak SSO session)
 *
 * Requires:
 * - session.idToken to be present
 * - Keycloak client to allow post_logout_redirect_uri
 */
export async function keycloakLogout({ idToken }) {
  // Always clear app session first
  await signOut({ redirect: false });

  const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
  const postLogout = `${window.location.origin}/`;

  // If we don't have the id_token or issuer, we can only do local logout.
  if (!issuer || !idToken) {
    window.location.href = postLogout;
    return;
  }

  const url = new URL(`${issuer}/protocol/openid-connect/logout`);
  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", postLogout);

  window.location.href = url.toString();
}

# Autentifikacni System (Keycloak + Next.js)

This repo is a minimal, runnable demo of a secure authentication setup:

- **Keycloak** = identity provider (registration, password storage, MFA/TOTP, brute-force defenses)
- **Next.js + NextAuth.js** = application that uses **OIDC Authorization Code Flow** with Keycloak

The UI is intentionally minimal. The focus is correctness + security controls.

## Quick start

### 1) Create `.env`

This repo ships with a dev-only `.env` (ignored by git), but in a real repo you should:

```bash
cp .env.example .env
```

### 2) Start everything

```bash
docker compose up --build
```

### 3) Open

- App: `http://localhost:3000`
- Keycloak Admin Console: `http://localhost:8080/admin/`

Keycloak bootstrap admin credentials come from `.env`:

- `KC_BOOTSTRAP_ADMIN_USERNAME=admin`
- `KC_BOOTSTRAP_ADMIN_PASSWORD=change-me-please-ca05c8f0e358e367`

## What the assignment asked for (mapping)

### Services

- `keycloak` (docker)  
- `web` (Next.js app, docker)

Both are started via docker compose.

### Required flow

1. User registers
2. User logs in
3. On first login user is forced to enroll MFA (TOTP)
4. On subsequent logins user must confirm login using MFA code

**How it's implemented:**

- Registration is initiated using `prompt=create` (Keycloak supports this for OIDC clients in versions >= 26.1.0).
- MFA enrollment is enforced by Keycloak **Required Action** `CONFIGURE_TOTP` set as default.
- Keycloak's default browser flow then asks for OTP on next logins automatically.

## Repo structure

```text
.
├── docker-compose.yml
├── keycloak/
│   └── realm-export.json
├── web/
│   ├── Dockerfile
│   ├── next.config.js
│   ├── pages/
│   ├── components/
│   └── lib/
└── docs/
    └── SECURITY_MAP.md
```

## Security controls implemented (high-signal items)

### 1) Credentials + MFA handled only by Keycloak
The Next.js app **never** receives user passwords or MFA secrets.

### 2) Client config hardening in `realm-export.json`
- **Authorization Code flow only** (`standardFlowEnabled: true`)
- **Direct Access Grants disabled** (prevents password-grant)
- **Redirect URI** set to the exact NextAuth callback:
  - `http://localhost:3000/api/auth/callback/keycloak`
- **Web Origins** set to the exact app origin:
  - `http://localhost:3000`

### 3) MFA enforced
`CONFIGURE_TOTP` is set as a default required action in the realm import.

### 4) Brute-force protection
Realm config enables brute-force protection with a lockout/backoff policy.

### 5) Password policy
Realm-level password policy is configured (min length, complexity, history, notUsername).

### 6) OAuth hardening in NextAuth
Keycloak provider uses:
- `checks: ["pkce", "state"]`

### 7) Logout that actually logs out
The “I clicked logout but I'm still logged in” problem is common with Keycloak + NextAuth.

This demo does:
1) NextAuth `signOut()` (clears app session cookie)
2) Redirect to Keycloak **RP-initiated logout** endpoint with:
   - `id_token_hint`
   - `post_logout_redirect_uri`

Keycloak client is configured with `post.logout.redirect.uris` so the redirect is allowed.

### 8) Minimal security headers
Some baseline headers are added in `web/next.config.js` (frame protection, nosniff, etc.).

## Troubleshooting (most common OAuth problems)

### Problem: Login works once, then breaks / can't login again
Common causes:
- Wrong **issuer** URL
- Wrong **redirect URI** configured in Keycloak
- Hostname mismatch (Keycloak says issuer is `localhost`, but NextAuth tries `keycloak`, etc.)

**This repo avoids that** by:
- Using `network_mode: host` for the web container
- Setting `KEYCLOAK_ISSUER=http://localhost:8080/realms/demo`

### Problem: Logout shows `invalid redirect uri`
Keycloak validates the `post_logout_redirect_uri` against the client's **Valid Post Logout Redirect URIs**.  
This repo sets it via the client attribute `post.logout.redirect.uris`.

## Notes for production
This is a demo. For production you would typically add:

- HTTPS everywhere (reverse proxy / TLS termination)
- Pinned images + dependency updates
- Better secret management (Docker secrets, Vault, etc.)
- Audit logging, alerting
- Email verification + password reset via SMTP
- CSP with nonces (instead of a weak CSP)
- Stronger rate limits at the edge

See `docs/SECURITY_MAP.md`.

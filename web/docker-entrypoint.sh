#!/bin/sh
set -eu

if [ -n "${KEYCLOAK_ISSUER:-}" ]; then
  DISCOVERY_URL="${KEYCLOAK_ISSUER}/.well-known/openid-configuration"
  echo "[web] Waiting for Keycloak discovery: ${DISCOVERY_URL}"
  i=0
  until curl -fsS "${DISCOVERY_URL}" >/dev/null 2>&1; do
    i=$((i+1))
    if [ "$i" -ge 60 ]; then
      echo "[web] WARNING: Keycloak not reachable after 60s. The app will still start, but login may fail until Keycloak is up."
      break
    fi
    sleep 1
  done
fi

exec "$@"

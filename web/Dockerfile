FROM node:20-alpine AS base

WORKDIR /app
ENV NODE_ENV=production

# Build-time public env vars (inlined into the browser bundle by Next.js)
ARG NEXT_PUBLIC_KEYCLOAK_ISSUER
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_KEYCLOAK_ISSUER=${NEXT_PUBLIC_KEYCLOAK_ISSUER}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# Add curl for a small "wait-for-keycloak" in entrypoint.
RUN apk add --no-cache curl

# Install deps first (better layer caching)
COPY package.json ./
RUN npm install --omit=dev

# Copy source and build
COPY . ./
RUN npm run build

# Runtime
EXPOSE 3000
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
